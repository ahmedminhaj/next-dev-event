import mongoose, { Document, Model, Schema, Types } from "mongoose";
import Event from "./event.model";

// TypeScript interface for a Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking schema definition
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string): boolean {
          // RFC 5322 compliant email regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Pre-save hook to validate that the referenced Event exists
bookingSchema.pre("save", async function (next) {
  // Only verify eventId if it's new or modified
  if (this.isModified("eventId")) {
    try {
      const eventExists = await Event.exists({ _id: this.eventId });

      if (!eventExists) {
        return next(
          new Error(
            `Event with ID ${this.eventId} does not exist. Cannot create booking for non-existent event.`
          )
        );
      }
    } catch (error) {
      return next(
        new Error(
          `Failed to verify event existence: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      );
    }
  }

  next();
});

// Create index on eventId for faster queries when fetching bookings by event
bookingSchema.index({ eventId: 1 });

// Export the Booking model
const Booking: Model<IBooking> =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
