'use client';
import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.actions";

const BookEvent = ({eventId, slug}: {eventId: string, slug: string}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {success} = await createBooking({eventId, slug, email});

    if (success) {
      setSubmitted(true)
    } else {
      console.error("Error creating booking event: ");
    }
  }

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="button-submit">Submit</button>
        </form>
      )}
    </div>
  )
}
export default BookEvent
