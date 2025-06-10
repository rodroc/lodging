import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { bookingsAPI } from '../api/api';

function HomePage({ user }) {
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [pastBookedDates, setPastBookedDates] = useState([]);
  const [bookingRanges, setBookingRanges] = useState([]);
  const [dateToBookingMap, setDateToBookingMap] = useState(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch booking dates if user is logged in
    if (user) {
      fetchBookingDates();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchBookingDates = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getCurrentMonthRanges();
      
      if (response.data.success) {
        const ranges = response.data.bookingRanges;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
        
        // Separate past and future dates, and assign alternating colors to ranges
        const futureBookedDates = [];
        const pastBookedDates = [];
        const dateMap = new Map();
        
        // Sort ranges by start date to ensure consistent color assignment
        const sortedRanges = ranges.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        sortedRanges.forEach((range, rangeIndex) => {
          // Generate all dates between startdate and enddate (inclusive)
          const startDate = new Date(range.startDate + 'T00:00:00');
          const endDate = new Date(range.endDate + 'T00:00:00');
          
          // Assign color based on range index (all dates in same range get same color)
          const colorType = rangeIndex % 2 === 0 ? 'odd' : 'even';
          
          const current = new Date(startDate);
          while (current <= endDate) {
            // Format date without timezone conversion
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, '0');
            const day = String(current.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const date = new Date(current);
            
            // Map each date to its booking info and color (same color for entire range)
            dateMap.set(dateStr, {
              bookingId: range.bookingId,
              colorType: colorType,
              note: range.note,
              startDate: range.startDate,
              endDate: range.endDate
            });
            
            if (date < today) {
              pastBookedDates.push(date);
            } else {
              futureBookedDates.push(date);
            }
            
            // Move to next day
            current.setDate(current.getDate() + 1);
          }
        });
        
        setBookingRanges(ranges);
        setDateToBookingMap(dateMap);
        setHighlightedDates(futureBookedDates);
        setPastBookedDates(pastBookedDates);
        
        console.log('Booking ranges:', ranges);
        console.log('Date to booking map:', dateMap);
        console.log('Future booked dates:', futureBookedDates);
        console.log('Past booked dates:', pastBookedDates);
      }
    } catch (error) {
      console.error('Error fetching booking dates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Custom day class name function for styling booked dates with alternating colors
  const getDayClassName = (date) => {
    // Format date without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const bookingInfo = dateToBookingMap.get(dateStr);
    
    if (bookingInfo) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isDateInPast = date < today;
      
      if (isDateInPast) {
        return 'past-booked-date';
      } else {
        // Alternating colors for future bookings
        return bookingInfo.colorType === 'odd' ? 'future-booked-odd' : 'future-booked-even';
      }
    }
    
    return '';
  };

  return (
    <>
      {/* Custom styles for booked dates with alternating colors */}
      <style>
        {`
          /* Past booked dates - light gray */
          .past-booked-date {
            background-color: #f3f4f6 !important;
            color: #9ca3af !important;
          }
          .past-booked-date:hover {
            background-color: #e5e7eb !important;
          }
          
          /* Future booked dates - odd ranges (green) */
          .future-booked-odd {
            background-color: #10b981 !important;
            color: white !important;
          }
          .future-booked-odd:hover {
            background-color: #059669 !important;
          }
          
          /* Future booked dates - even ranges (yellow) */
          .future-booked-even {
            background-color: #eab308 !important;
            color: white !important;
          }
          .future-booked-even:hover {
            background-color: #ca8a04 !important;
          }

          /* Mobile optimizations */
          @media (max-width: 768px) {
            .react-datepicker {
              width: 100% !important;
              max-width: 350px !important;
            }
            .react-datepicker__month-container {
              width: 100% !important;
            }
            .react-datepicker__day {
              width: 2.5rem !important;
              height: 2.5rem !important;
              line-height: 2.5rem !important;
              margin: 0.1rem !important;
            }
          }
        `}
      </style>
      
      {/* Full-page mobile-optimized layout */}
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Welcome to Lodging App
          </h1>
          {user && (
            <p className="text-sm sm:text-lg text-gray-600">
              Hello, {user.name}! Days without highlight are available for you.
            </p>
          )}
          {!user && (
            <p className="text-sm sm:text-lg text-gray-600">
              Please log in to view your booking calendar.
            </p>
          )}
        </div>

        {/* Main Calendar Container - Full width on mobile */}
        {user && (
          <div className="max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500">Loading calendar...</div>
                </div>
              ) : (
                <>
                  {/* React DatePicker Calendar - Read-only, no events */}
                  <div className="flex justify-center mb-4">
                    <DatePicker
                      selected={null}
                      inline
                      openToDate={new Date()}
                      highlightDates={highlightedDates}
                      dayClassName={getDayClassName}
                      className="w-full"
                      readOnly={true}
                      disabled={true}
                    />
                  </div>
                  
                </>
              )}
            </div>
          </div>
        )}

        {/* Welcome message for non-logged in users */}
        {!user && (
          <div className="max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-gray-500 space-y-4">
                <p>Please log in to access your booking calendar and account features.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage; 