import db from "./db.js";

//For GET Request to view all seats
export const getSeats = async (event) => {
  //Get all seats
  const result = await (
    await db.pool
  ).query(
    `
    SELECT seat_id, is_reserved
    FROM seats
    ORDER BY seat_id
    `
  );

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      seats: result,
    }),
  };
};

//For POST Request to book seats
export const bookSeats = async (event) => {
  const { requestedSeats } = JSON.parse(event.body);

  //Validation for requestedSeats
  if (!requestedSeats || requestedSeats < 1 || requestedSeats > 7) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "You can book between 1 and 7 seats at a time. ",
      }),
    };
  }

  //Get available seats
  const result = await (
    await db.pool
  ).query(
    `
    SELECT seat_id
    FROM seats
    WHERE is_reserved = 0
    ORDER BY seat_id
    LIMIT ?
    `,
    [requestedSeats]
  );

  //Validation for not enough seats
  if (result.length < requestedSeats) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message:
          "Requested seats are not available . Only " +
          result.length +
          " seats are available",
      }),
    };
  } else {
    //For last booking id
    const booking_id = await (
      await db.pool
    ).query(
      `
    SELECT booking_id
    FROM seats
    ORDER BY booking_id DESC
    `
    );

    const bookingId = booking_id.length > 0 ? booking_id[0].booking_id + 1 : 1;
    const seatIds = result.map((seat) => seat.seat_id);

    //Reserve seats
    await (
      await db.pool
    ).query(
      `
      UPDATE seats
      SET is_reserved = 1 , booking_id = ?
      WHERE seat_id IN (?)
      `,
      [bookingId, seatIds]
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Seats reserved successfully. Your booking id is " + bookingId,
      }),
    };
  }
};

//For POST Request to cancel booking
export const cancelBooking = async (event) => {
  const { bookingId } = JSON.parse(event.body);

  //query for seat_id for particular booking_id
  const result = await (
    await db.pool
  ).query(
    `
    SELECT seat_id
    FROM seats
    WHERE booking_id = ?
    `,
    [bookingId]
  );

  //Validation for booking_id not found
  if (result.length < 1) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Booking not found",
      }),
    };
  }

  //unreserve seats for booking
  await (
    await db.pool
  ).query(
    `
    UPDATE seats
    SET is_reserved = 0
    WHERE booking_id = ?
    `,
    [bookingId]
  );

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      message: "Booking cancelled successfully",
    }),
  };
};
