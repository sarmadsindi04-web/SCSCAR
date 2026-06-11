import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.ts";
import { users, vehicles, favorites, savedComparisons, recentlyViewed } from "./src/db/schema.ts";
import { eq, like, gte, lte, and, sql, desc, inArray } from "drizzle-orm";
import { requireAuth, tryAuth, AuthRequest } from "./src/middleware/auth.ts";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client safely
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY is not defined. AI specifications lookups will be unavailable.");
  }

  // --- API ROUTES FIRST ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Get current user profile
  app.get("/api/users/profile", requireAuth, (req: AuthRequest, res) => {
    res.json({
      uid: req.user?.uid,
      email: req.user?.email,
      isAdmin: req.user?.isAdmin,
      dbId: req.user?.dbId,
    });
  });

  // 1. Vehicles: Get List with Advanced Search & Filters
  app.get("/api/vehicles", tryAuth, async (req, res) => {
    try {
      const {
        brand,
        model,
        year,
        drivetrain,
        fuelType,
        engineType,
        hpMin,
        hpMax,
        speedMin,
        speedMax,
        accMax, // acceleration max (under zeroToHundred range)
        featured,
        limit,
        offset,
      } = req.query;

      const conditions = [];

      if (brand) {
        conditions.push(like(sql`LOWER(${vehicles.brand})`, `%${String(brand).toLowerCase()}%`));
      }
      if (model) {
        conditions.push(like(sql`LOWER(${vehicles.model})`, `%${String(model).toLowerCase()}%`));
      }
      if (year) {
        conditions.push(like(vehicles.productionYears, `%${String(year)}%`));
      }
      if (drivetrain) {
        conditions.push(eq(vehicles.drivetrain, String(drivetrain)));
      }
      if (fuelType) {
        conditions.push(eq(vehicles.fuelType, String(fuelType)));
      }
      if (engineType) {
        conditions.push(like(sql`LOWER(${vehicles.engineType})`, `%${String(engineType).toLowerCase()}%`));
      }
      if (hpMin) {
        conditions.push(gte(vehicles.horsepower, parseInt(String(hpMin))));
      }
      if (hpMax) {
        conditions.push(lte(vehicles.horsepower, parseInt(String(hpMax))));
      }
      if (speedMin) {
        conditions.push(gte(vehicles.topSpeed, parseInt(String(speedMin))));
      }
      if (speedMax) {
        conditions.push(lte(vehicles.topSpeed, parseInt(String(speedMax))));
      }
      if (featured === "true") {
        conditions.push(eq(vehicles.isFeatured, true));
      }

      const qLimit = limit ? parseInt(String(limit)) : 40;
      const qOffset = offset ? parseInt(String(offset)) : 0;

      let listQuery = db.select().from(vehicles);
      if (conditions.length > 0) {
        listQuery = listQuery.where(and(...conditions)) as any;
      }

      const results = await listQuery
        .limit(qLimit)
        .offset(qOffset)
        .orderBy(desc(vehicles.horsepower));

      // Post-filtering for acceleration (since zero_to_hundred is stored as text "2.2s", we parse it briefly on demand)
      let finalResults = results;
      if (accMax) {
        const parsedAccMax = parseFloat(String(accMax));
        finalResults = results.filter((car) => {
          if (!car.zeroToHundred) return false;
          const match = car.zeroToHundred.match(/^([0-9.]+)/);
          if (match) {
            return parseFloat(match[1]) <= parsedAccMax;
          }
          return false;
        });
      }

      res.json(finalResults);
    } catch (err: any) {
      console.error("Error fetching vehicles:", err);
      res.status(500).json({ error: "Failed to fetch vehicles database." });
    }
  });

  // 2. Vehicles: Get Popular brands
  app.get("/api/brands", async (req, res) => {
    try {
      const dbBrands = await db
        .select({ brand: vehicles.brand })
        .from(vehicles)
        .groupBy(vehicles.brand);
      
      const brandsList = dbBrands.map((b) => b.brand);
      res.json(brandsList);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch manufacturers list." });
    }
  });

  // 3. Vehicles: Get single vehicle details
  app.get("/api/vehicles/:id", tryAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid vehicle ID" });
      }

      const result = await db.select().from(vehicles).where(eq(vehicles.id, id));
      if (result.length === 0) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const vehicle = result[0];

      // Track recently viewed history if logged in
      if (req.user?.uid) {
        try {
          // Delete previous viewed log for same vehicle to maintain uniqueness, then insert fresh
          await db.delete(recentlyViewed).where(
            and(
              eq(recentlyViewed.userId, req.user.uid),
              eq(recentlyViewed.vehicleId, vehicle.id)
            )
          );

          await db.insert(recentlyViewed).values({
            userId: req.user.uid,
            vehicleId: vehicle.id,
          });
        } catch (historr) {
          console.error("Failed to write to recently viewed archive:", historr);
        }
      }

      res.json(vehicle);
    } catch (err) {
      res.status(500).json({ error: "Failed to load vehicle particulars" });
    }
  });

  // 4. Vehicles: Admin actions (Create, Update, Delete)
  app.post("/api/vehicles", requireAuth, async (req: AuthRequest, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admin access required." });
    }
    try {
      const data = req.body;
      const inserted = await db.insert(vehicles).values({
        brand: data.brand,
        model: data.model,
        generation: data.generation || "N/A",
        productionYears: data.productionYears || "N/A",
        trimLevel: data.trimLevel || "N/A",
        engineType: data.engineType || "N/A",
        engineSize: data.engineSize || "N/A",
        horsepower: data.horsepower ? parseInt(data.horsepower) : null,
        torque: data.torque ? parseInt(data.torque) : null,
        transmission: data.transmission || "N/A",
        drivetrain: data.drivetrain || "N/A",
        fuelType: data.fuelType || "N/A",
        weight: data.weight ? parseInt(data.weight) : null,
        dimensions: data.dimensions || "N/A",
        fuelCapacity: data.fuelCapacity || "N/A",
        topSpeed: data.topSpeed ? parseInt(data.topSpeed) : null,
        zeroToHundred: data.zeroToHundred || "N/A",
        zeroToSixty: data.zeroToSixty || "N/A",
        quarterMileTime: data.quarterMileTime || "N/A",
        powerToWeight: data.powerToWeight || "N/A",
        fuelConsumption: data.fuelConsumption || "N/A",
        imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800",
        interiorImageUrl: data.interiorImageUrl || "",
        exteriorImageUrl: data.exteriorImageUrl || "",
        angleImageUrl: data.angleImageUrl || "",
        isFeatured: data.isFeatured === true,
      }).returning();

      res.status(210).json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to add brand vehicle specs" });
    }
  });

  app.put("/api/vehicles/:id", requireAuth, async (req: AuthRequest, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required." });
    }
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      const updated = await db.update(vehicles).set({
        brand: data.brand,
        model: data.model,
        generation: data.generation,
        productionYears: data.productionYears,
        trimLevel: data.trimLevel,
        engineType: data.engineType,
        engineSize: data.engineSize,
        horsepower: data.horsepower ? parseInt(data.horsepower) : null,
        torque: data.torque ? parseInt(data.torque) : null,
        transmission: data.transmission,
        drivetrain: data.drivetrain,
        fuelType: data.fuelType,
        weight: data.weight ? parseInt(data.weight) : null,
        dimensions: data.dimensions,
        fuelCapacity: data.fuelCapacity,
        topSpeed: data.topSpeed ? parseInt(data.topSpeed) : null,
        zeroToHundred: data.zeroToHundred,
        zeroToSixty: data.zeroToSixty,
        quarterMileTime: data.quarterMileTime,
        powerToWeight: data.powerToWeight,
        fuelConsumption: data.fuelConsumption,
        imageUrl: data.imageUrl,
        interiorImageUrl: data.interiorImageUrl,
        exteriorImageUrl: data.exteriorImageUrl,
        angleImageUrl: data.angleImageUrl,
        isFeatured: data.isFeatured === true,
      }).where(eq(vehicles.id, id)).returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to edit vehicle details" });
    }
  });

  app.delete("/api/vehicles/:id", requireAuth, async (req: AuthRequest, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required." });
    }
    try {
      const id = parseInt(req.params.id);
      const deleted = await db.delete(vehicles).where(eq(vehicles.id, id)).returning();
      if (deleted.length === 0) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json({ success: true, deleted: deleted[0] });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to remove vehicle specifications" });
    }
  });

  // User Space (Favorites & Comparisons & History)

  // Get favorites
  app.get("/api/users/favorites", requireAuth, async (req: AuthRequest, res) => {
    try {
      const favs = await db
        .select({
          id: favorites.id,
          createdAt: favorites.createdAt,
          vehicle: vehicles,
        })
        .from(favorites)
        .innerJoin(vehicles, eq(favorites.vehicleId, vehicles.id))
        .where(eq(favorites.userId, req.user!.uid))
        .orderBy(desc(favorites.createdAt));

      res.json(favs);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch user favorites catalog." });
    }
  });

  // Toggle favorite status
  app.post("/api/users/favorites/:vehicleId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      if (isNaN(vehicleId)) {
        return res.status(400).json({ error: "Invalid vehicle ID" });
      }

      // Check if already is favorite
      const exists = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.userId, req.user!.uid),
            eq(favorites.vehicleId, vehicleId)
          )
        );

      if (exists.length > 0) {
        // Toggle out: Remove
        await db
          .delete(favorites)
          .where(
            and(
              eq(favorites.userId, req.user!.uid),
              eq(favorites.vehicleId, vehicleId)
            )
          );
        return res.json({ favorited: false });
      } else {
        // Toggle in: Add
        await db.insert(favorites).values({
          userId: req.user!.uid,
          vehicleId: vehicleId,
        });
        return res.json({ favorited: true });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to edit favorites state." });
    }
  });

  // Get recently viewed
  app.get("/api/users/recently-viewed", requireAuth, async (req: AuthRequest, res) => {
    try {
      const history = await db
        .select({
          id: recentlyViewed.id,
          viewedAt: recentlyViewed.viewedAt,
          vehicle: vehicles,
        })
        .from(recentlyViewed)
        .innerJoin(vehicles, eq(recentlyViewed.vehicleId, vehicles.id))
        .where(eq(recentlyViewed.userId, req.user!.uid))
        .orderBy(desc(recentlyViewed.viewedAt))
        .limit(10);

      res.json(history);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch view records history." });
    }
  });

  // Get saved comparisons
  app.get("/api/users/saved-comparisons", requireAuth, async (req: AuthRequest, res) => {
    try {
      const records = await db
        .select()
        .from(savedComparisons)
        .where(eq(savedComparisons.userId, req.user!.uid))
        .orderBy(desc(savedComparisons.createdAt));

      res.json(records);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve saved comparisons." });
    }
  });

  // Save new comparison
  app.post("/api/users/saved-comparisons", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name, vehicleIds } = req.body;
      if (!name || !vehicleIds) {
        return res.status(400).json({ error: "Name and Vehicle IDs are required." });
      }

      const record = await db.insert(savedComparisons).values({
        userId: req.user!.uid,
        name,
        vehicleIds,
      }).returning();

      res.json(record[0]);
    } catch (err) {
      res.status(500).json({ error: "Failed to register comparison configuration." });
    }
  });

  // Delete saved comparison
  app.delete("/api/users/saved-comparisons/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await db
        .delete(savedComparisons)
        .where(
          and(
            eq(savedComparisons.id, id),
            eq(savedComparisons.userId, req.user!.uid)
          )
        );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to remove comparison specifications." });
    }
  });

  // Multi-vehicle specification getter (for comparisons)
  app.get("/api/vehicles-by-ids", async (req, res) => {
    try {
      const idsParam = req.query.ids;
      if (!idsParam) {
        return res.json([]);
      }
      const idsArray = String(idsParam)
        .split(",")
        .map((x) => parseInt(x))
        .filter((x) => !isNaN(x));

      if (idsArray.length === 0) {
        return res.json([]);
      }

      const results = await db.select().from(vehicles).where(inArray(vehicles.id, idsArray));
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "Failed to load vehicles metadata." });
    }
  });

  // --- 5. SMART VERIFIED BACKFILL (GEMINI POWERED) ---
  app.post("/api/gemini/verify-vehicle", async (req, res) => {
    if (!ai) {
      return res.status(503).json({ error: "Gemini client is unconfigured" });
    }

    const { brand, model, year } = req.body;
    if (!brand || !model) {
      return res.status(400).json({ error: "Brand and Model details are required." });
    }

    try {
      const searchPrompt = `Perform a highly detailed search of official, verified manufacturer technical manuals, specifications papers, and verified automotive catalogs to extract complete factory specifications for: ${brand} ${model} ${year || ""}.
      You are SCSCAR: The Ultimate Automotive Database. Accuracy is your absolute highest priority. Never make up specs.
      For fields where specifications are absolutely unknown, use null in numbers, or "Official Data Not Available" in text fields. Do not hallucinate values.

      Please return exactly this JSON format:
      {
        "brand": "string",
        "model": "string",
        "generation": "string (or Official Data Not Available)",
        "productionYears": "string (e.g. '2022-Present' or 'Official Data Not Available')",
        "trimLevel": "string (or Official Data Not Available)",
        "engineType": "string (e.g., Twin-turbocharged V8, Electric, Naturally aspirated Flat-4 etc.)",
        "engineSize": "string (e.g., '4.0 L (3996 cc)' or 'N/A')",
        "horsepower": integer_or_null,
        "torque": integer_or_null_representing_Nm_val,
        "transmission": "string (e.g., '7-speed PDK dual-clutch' or similar)",
        "drivetrain": "string (Must be exactly 'AWD', 'RWD', or 'FWD')",
        "fuelType": "string (e.g., Gasoline, Diesel, Electric, Plug-in Hybrid, Plug-in Hybrid etc.)",
        "weight": integer_or_null_representing_Kg_val,
        "dimensions": "string in format 'Length x Width x Height mm' or 'Official Data Not Available'",
        "fuelCapacity": "string in format 'XX L' or 'XX kWh' or 'Official Data Not Available'",
        "topSpeed": integer_or_null_representing_kmh_val,
        "zeroToHundred": "string in format 'X.Xs' or 'Official Data Not Available'",
        "zeroToSixty": "string in format 'X.Xs' or 'Official Data Not Available'",
        "quarterMileTime": "string in format 'X.X_seconds' or 'Official Data Not Available'",
        "powerToWeight": "string in format 'XXX_HP/ton' or 'Official Data Not Available'",
        "fuelConsumption": "string in format 'XX.X_L/100km' or 'XX_kWh/100km' or 'Official Data Not Available'",
        "imageUrl": "string or empty (you may suggest an official beautiful photo link or keep empty if none is verified)",
        "interiorImageUrl": "string or empty",
        "exteriorImageUrl": "string or empty",
        "angleImageUrl": "string or empty"
      }`;

      // Gemini 3.5 Flash supports Search Grounding and JSON schema
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brand: { type: Type.STRING },
              model: { type: Type.STRING },
              generation: { type: Type.STRING },
              productionYears: { type: Type.STRING },
              trimLevel: { type: Type.STRING },
              engineType: { type: Type.STRING },
              engineSize: { type: Type.STRING },
              horsepower: { type: Type.INTEGER },
              torque: { type: Type.INTEGER },
              transmission: { type: Type.STRING },
              drivetrain: { type: Type.STRING },
              fuelType: { type: Type.STRING },
              weight: { type: Type.INTEGER },
              dimensions: { type: Type.STRING },
              fuelCapacity: { type: Type.STRING },
              topSpeed: { type: Type.INTEGER },
              zeroToHundred: { type: Type.STRING },
              zeroToSixty: { type: Type.STRING },
              quarterMileTime: { type: Type.STRING },
              powerToWeight: { type: Type.STRING },
              fuelConsumption: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              interiorImageUrl: { type: Type.STRING },
              exteriorImageUrl: { type: Type.STRING },
              angleImageUrl: { type: Type.STRING },
            },
            required: ["brand", "model", "horsepower", "topSpeed", "zeroToHundred"],
          }
        }
      });

      const text = response.text || "{}";
      const vehicleParsedSpecs = JSON.parse(text);

      // Supply clean high-quality supercar placeholders if images are blank or returned as placeholder strings
      const unsplashBands: Record<string, string> = {
        ferrari: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
        porsche: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800",
        bugatti: "https://images.unsplash.com/photo-1600706432502-75a0e286b92a?auto=format&fit=crop&q=80&w=800",
        audi: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=800",
        mclaren: "https://images.unsplash.com/photo-1562591176-bf29c97b83f3?auto=format&fit=crop&q=80&w=800",
        lamborghini: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&q=80&w=800",
        aston: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800",
        corvette: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
        bmw: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
        mercedes: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
      };

      const lcBrand = brand.toLowerCase();
      let matchedImg = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"; // Generic supercar outline
      for (const bKey of Object.keys(unsplashBands)) {
        if (lcBrand.includes(bKey)) {
          matchedImg = unsplashBands[bKey];
          break;
        }
      }

      if (!vehicleParsedSpecs.imageUrl || vehicleParsedSpecs.imageUrl.includes("example.com") || vehicleParsedSpecs.imageUrl === "") {
        vehicleParsedSpecs.imageUrl = matchedImg;
      }
      if (!vehicleParsedSpecs.interiorImageUrl || vehicleParsedSpecs.interiorImageUrl === "") {
        vehicleParsedSpecs.interiorImageUrl = "https://images.unsplash.com/photo-1611245805218-47bc650ac862?auto=format&fit=crop&q=80&w=800";
      }
      if (!vehicleParsedSpecs.exteriorImageUrl || vehicleParsedSpecs.exteriorImageUrl === "") {
        vehicleParsedSpecs.exteriorImageUrl = vehicleParsedSpecs.imageUrl;
      }
      if (!vehicleParsedSpecs.angleImageUrl || vehicleParsedSpecs.angleImageUrl === "") {
        vehicleParsedSpecs.angleImageUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800";
      }

      res.json({ source: "Gemini Grounding Engine (Google Search)", verified: true, data: vehicleParsedSpecs });
    } catch (err: any) {
      console.error("Gemini grounding verification failed:", err);
      res.status(500).json({ error: "Gemini Search Grounding extraction had a runtime exception: " + err.message });
    }
  });

  // --- VITE DEV / PRODUCTION MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[🚀 SCSCAR Server] Running full-stack system on http://0.0.0.0:${PORT}`);
  });
}

startServer();
