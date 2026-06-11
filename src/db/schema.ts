import { pgTable, serial, text, integer, boolean, timestamp, doublePrecision, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Table (Linked directly to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Vehicles Database Table
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  generation: text('generation'),
  productionYears: text('production_years'),
  trimLevel: text('trim_level'),
  engineType: text('engine_type'),
  engineSize: text('engine_size'),
  horsepower: integer('horsepower'),
  torque: integer('torque'),
  transmission: text('transmission'),
  drivetrain: text('drivetrain'),
  fuelType: text('fuel_type'),
  weight: integer('weight'), // in kg
  dimensions: text('dimensions'), // e.g. "4544 x 1900 x 1279 mm"
  fuelCapacity: text('fuel_capacity'), // e.g. "64 L"
  topSpeed: integer('top_speed'), // in km/h
  zeroToHundred: text('zero_to_hundred'), // e.g. "3.2s"
  zeroToSixty: text('zero_to_sixty'), // e.g. "3.0s"
  quarterMileTime: text('quarter_mile_time'),
  powerToWeight: text('power_to_weight'), // e.g. "450 HP/ton"
  fuelConsumption: text('fuel_consumption'), // e.g. "12.4 L/100km"
  imageUrl: text('image_url'), // Main exterior
  interiorImageUrl: text('interior_image_url'),
  exteriorImageUrl: text('exterior_image_url'),
  angleImageUrl: text('angle_image_url'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Favorites Table
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Saved Comparisons Table
export const savedComparisons = pgTable('saved_comparisons', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  vehicleIds: text('vehicle_ids').notNull(), // Comma separated IDs (e.g. "1,4,12")
  createdAt: timestamp('created_at').defaultNow(),
});

// Recently Viewed Vehicles Table
export const recentlyViewed = pgTable('recently_viewed', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  viewedAt: timestamp('viewed_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
  savedComparisons: many(savedComparisons),
  recentlyViewed: many(recentlyViewed),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  favorites: many(favorites),
  recentlyViewed: many(recentlyViewed),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.uid],
  }),
  vehicle: one(vehicles, {
    fields: [favorites.vehicleId],
    references: [vehicles.id],
  }),
}));

export const recentlyViewedRelations = relations(recentlyViewed, ({ one }) => ({
  user: one(users, {
    fields: [recentlyViewed.userId],
    references: [users.uid],
  }),
  vehicle: one(vehicles, {
    fields: [recentlyViewed.vehicleId],
    references: [vehicles.id],
  }),
}));

export const savedComparisonsRelations = relations(savedComparisons, ({ one }) => ({
  user: one(users, {
    fields: [savedComparisons.userId],
    references: [users.uid],
  }),
}));
