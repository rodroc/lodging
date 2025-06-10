import express from 'express';
import { db } from '../db/setup.js';

const router = express.Router();

// Get booking dates for current month
router.get('/current-month-dates', async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
    
    // Get first day of current month
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    // Get first day of next month
    const firstDayNextMonth = new Date(currentYear, currentMonth, 1);
    
    // Query to get unique dates for current month
    const bookingDates = await db('bookings')
      .select('startdate', 'enddate')
      .where(function() {
        this.whereNotNull('startdate')
          .orWhereNotNull('enddate');
      })
      .andWhere(function() {
        this.whereBetween('startdate', [firstDay, firstDayNextMonth])
          .orWhereBetween('enddate', [firstDay, firstDayNextMonth]);
      })
      .andWhere(function() {
        this.whereNull('is_deleted')
          .orWhere('is_deleted', false);
      });

    // Create a Set to store unique dates
    const uniqueDates = new Set();
    
    bookingDates.forEach(booking => {
      if (booking.startdate && booking.enddate) {
        const startDate = new Date(booking.startdate);
        const endDate = new Date(booking.enddate);
        
        // Generate all dates between startdate and enddate (inclusive)
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          // Check if date is in current month
          if (currentDate.getFullYear() === currentYear && currentDate.getMonth() + 1 === currentMonth) {
            uniqueDates.add(currentDate.toISOString().split('T')[0]);
          }
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // Handle cases where only start or end date exists
        if (booking.startdate) {
          const startDate = new Date(booking.startdate);
          if (startDate.getFullYear() === currentYear && startDate.getMonth() + 1 === currentMonth) {
            uniqueDates.add(startDate.toISOString().split('T')[0]);
          }
        }
        if (booking.enddate) {
          const endDate = new Date(booking.enddate);
          if (endDate.getFullYear() === currentYear && endDate.getMonth() + 1 === currentMonth) {
            uniqueDates.add(endDate.toISOString().split('T')[0]);
          }
        }
      }
    });

    // Convert Set to Array
    const datesArray = Array.from(uniqueDates);
    
    res.json({
      success: true,
      dates: datesArray,
      month: currentMonth,
      year: currentYear
    });
    
  } catch (error) {
    console.error('Error fetching booking dates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking dates'
    });
  }
});

// Get booking ranges for calendar view (includes last month through next month)
router.get('/current-month-ranges', async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
    
    // Get first day of last month
    const firstDayLastMonth = new Date(currentYear, currentMonth - 2, 1);
    // Get first day of month after next (to include all of next month)
    const firstDayAfterNextMonth = new Date(currentYear, currentMonth + 1, 1);
    
    // Query to get booking ranges from last month through next month
    const bookingRanges = await db('bookings')
      .select('id', 'startdate', 'enddate', 'note')
      .where(function() {
        this.whereNotNull('startdate')
          .orWhereNotNull('enddate');
      })
      .andWhere(function() {
        this.whereBetween('startdate', [firstDayLastMonth, firstDayAfterNextMonth])
          .orWhereBetween('enddate', [firstDayLastMonth, firstDayAfterNextMonth]);
      })
      .andWhere(function() {
        this.whereNull('is_deleted')
          .orWhere('is_deleted', false);
      })
      .orderBy('startdate', 'asc');

    // Process each booking range to generate date arrays
    const processedRanges = bookingRanges.map(booking => {
      const dates = [];
      
      if (booking.startdate && booking.enddate) {
        const startDate = new Date(booking.startdate);
        const endDate = new Date(booking.enddate);
        
        // Generate all dates between startdate and enddate (inclusive)
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          // Include all dates in the expanded range (last month through next month)
          dates.push(currentDate.toISOString().split('T')[0]);
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // Handle cases where only start or end date exists
        if (booking.startdate) {
          const startDate = new Date(booking.startdate);
          dates.push(startDate.toISOString().split('T')[0]);
        }
        if (booking.enddate) {
          const endDate = new Date(booking.enddate);
          dates.push(endDate.toISOString().split('T')[0]);
        }
      }
      
      return {
        bookingId: booking.id,
        startDate: booking.startdate ? booking.startdate.toISOString().split('T')[0] : null,
        endDate: booking.enddate ? booking.enddate.toISOString().split('T')[0] : null,
        note: booking.note,
        dates: dates
      };
    }).filter(range => range.dates.length > 0); // Only include ranges with valid dates
    
    res.json({
      success: true,
      bookingRanges: processedRanges,
      month: currentMonth,
      year: currentYear
    });
    
  } catch (error) {
    console.error('Error fetching booking ranges:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking ranges'
    });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { startdate, enddate, note } = req.body;
    
    // Validate required fields
    if (!startdate) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required'
      });
    }
    
    // If no end date provided, use start date
    const finalEndDate = enddate || startdate;
    
    // Insert the new booking
    const [bookingId] = await db('bookings')
      .insert({
        startdate: startdate,
        enddate: finalEndDate,
        note: note || null,
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false
      })
      .returning('id');
    
    res.json({
      success: true,
      message: 'Booking created successfully',
      bookingId: bookingId
    });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking'
    });
  }
});

// Release (soft delete) bookings that overlap with the given date range
router.delete('/release', async (req, res) => {
  try {
    const { startdate, enddate } = req.body;
    
    // Validate required fields
    if (!startdate) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required'
      });
    }
    
    // If no end date provided, use start date
    const finalEndDate = enddate || startdate;
    
    // Find bookings that intersect with the selected date range
    // A booking intersects if any of these conditions are true:
    // 1. Selected dates overlap with booking date range
    // 2. Booking startdate or enddate falls within selected range
    // 3. Selected range falls within booking date range


    console.log({startdate,enddate,finalEndDate})

    const overlappingBookings = await db('bookings')
      .where(function() {
        this.whereNull('is_deleted').orWhere('is_deleted', false);
      })
      .andWhere(function() {
        // Standard overlap detection: booking overlaps with selected range
        this.where(function() {
          this.where('startdate', '<=', finalEndDate)
              .andWhere('enddate', '>=', startdate);
        })
        // OR booking startdate is within selected range
        .orWhere(function() {
          this.whereBetween('startdate', [startdate, finalEndDate]);
        })
        // OR booking enddate is within selected range  
        .orWhere(function() {
          this.whereBetween('enddate', [startdate, finalEndDate]);
        })
        // OR selected range is completely within booking range
        .orWhere(function() {
          this.where('startdate', '<=', startdate)
              .andWhere('enddate', '>=', finalEndDate);
        })
        // OR exact match for single date selections
        .orWhere(function() {
          this.where('startdate', '=', startdate)
              .orWhere('startdate', '=', enddate)
              .orWhere('startdate', '=', finalEndDate)
              .orWhere('enddate', '=', startdate)
              .orWhere('enddate', '=', enddate)
              .orWhere('enddate', '=', finalEndDate);
        });
      });
    
    if (overlappingBookings.length === 0) {
      return res.json({
        success: true,
        message: 'No overlapping bookings found',
        releasedCount: 0
      });
    }
    
    // Soft delete the overlapping bookings
    const releasedCount = await db('bookings')
      .whereIn('id', overlappingBookings.map(booking => booking.id))
      .update({
        is_deleted: true,
        updated_at: new Date()
      });
    
    res.json({
      success: true,
      message: `Successfully released ${releasedCount} booking(s)`,
      releasedCount: releasedCount,
      releasedBookings: overlappingBookings.map(b => ({ id: b.id, startdate: b.startdate, enddate: b.enddate }))
    });
    
  } catch (error) {
    console.error('Error releasing bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error releasing bookings'
    });
  }
});

export default router; 