import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { bookingsAPI } from '../api/api';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [pastBookedDates, setPastBookedDates] = useState([]);
  const [bookingRanges, setBookingRanges] = useState([]);
  const [dateToBookingMap, setDateToBookingMap] = useState(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch booking dates for current month
    fetchBookingDates();
  }, []);

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

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  // Check if selected dates overlap with any booked dates (past or future)
  const isSelectedDateBooked = () => {
    if (!startDate) return false;
    
    // Create array of all dates in selected range
    const selectedDates = [];
    const current = new Date(startDate);
    const endDateToCheck = endDate || startDate;
    
    while (current <= endDateToCheck) {
      selectedDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    // Check if any selected date overlaps with any booked dates (past or future)
    return selectedDates.some(selectedDate => {
      // Format date without timezone conversion
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const selectedDateStr = `${year}-${month}-${day}`;
      return dateToBookingMap.has(selectedDateStr);
    });
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

  const handleRelease = async () => {
    if (!startDate || !isSelectedDateBooked()) {
      console.log('Cannot release: no dates selected or dates not booked');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare date range data - format dates without timezone conversion
      const formatDateForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const dateRange = {
        startdate: formatDateForAPI(startDate),
        enddate: endDate ? formatDateForAPI(endDate) : formatDateForAPI(startDate)
      };

      console.log('Releasing bookings for date range:', dateRange);

      // Call API to release bookings
      const response = await bookingsAPI.releaseBookings(dateRange);
      
      if (response.data.success) {
        console.log('Bookings released successfully:', response.data);
        
        // Clear selected dates
        setStartDate(null);
        setEndDate(null);
        
        // Refresh highlighted dates to remove the released bookings
        await fetchBookingDates();
        
        // Show success message
        const { releasedCount, message } = response.data;
        alert(`${message}\nReleased ${releasedCount} booking(s).`);
      }
    } catch (error) {
      console.error('Error releasing bookings:', error);
      alert('Error releasing bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (!startDate || isSelectedDateBooked()) {
      console.log('Cannot close: no dates selected or dates already booked');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare booking data - format dates without timezone conversion
      const formatDateForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const bookingData = {
        startdate: formatDateForAPI(startDate),
        enddate: endDate ? formatDateForAPI(endDate) : formatDateForAPI(startDate),
        note: 'Booking created from dashboard'
      };

      console.log('Creating booking:', bookingData);

      // Call API to create booking
      const response = await bookingsAPI.createBooking(bookingData);
      
      if (response.data.success) {
        console.log('Booking created successfully:', response.data);
        
        // Clear selected dates
        setStartDate(null);
        setEndDate(null);
        
        // Refresh highlighted dates to show the new booking
        await fetchBookingDates();
        
        // You could add a success notification here
        alert('Booking created successfully!');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Booking Calendar
          </h1>
          {user && (
            <p className="text-sm sm:text-lg text-gray-600">
              Hello, {user.name}! Manage your bookings below.
            </p>
          )}
        </div>

        {/* Main Calendar Container - Full width on mobile */}
        <div className="max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Loading calendar...</div>
              </div>
            ) : (
              <>
                {/* React DatePicker Calendar - Responsive */}
                <div className="flex justify-center mb-4">
                  <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    inline
                    openToDate={new Date()}
                    minDate={new Date()}
                    highlightDates={highlightedDates}
                    dayClassName={getDayClassName}
                    className="w-full"
                    placeholderText="Select dates"
                  />
                </div>
                
                {/* Display booking info */}
                {highlightedDates.length > 0 /*&& (
                  <div className="text-xs sm:text-sm text-blue-600 text-center mb-4">
                    {highlightedDates.length} booking date(s) highlighted with alternating colors
                  </div>
                )*/}
                
                {/* Selected Date Range Info */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
                  <div className="text-sm sm:text-base text-gray-600 space-y-2">
                    {startDate && (
                      <div className="flex justify-between">
                        <span className="font-medium">Check-in:</span>
                        <span>{startDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    {endDate && (
                      <div className="flex justify-between">
                        <span className="font-medium">Check-out:</span>
                        <span>{endDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    {startDate && endDate && (
                      <div className="flex justify-between text-blue-600 font-medium">
                        <span>Duration:</span>
                        <span>{Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} nights</span>
                      </div>
                    )}
                    {!endDate && startDate && (
                      <p className="text-gray-500 italic text-center">Select check-out date</p>
                    )}
                    {!startDate && !loading && (
                      <p className="text-gray-500 italic text-center">Select check-in date to begin</p>
                    )}
                    {startDate && (
                      <div className={`text-xs sm:text-sm font-medium text-center p-2 rounded ${
                        isSelectedDateBooked() ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isSelectedDateBooked() 
                          ? '📅 Booked dates selected - Use Release to unbook' 
                          : '🆓 Available dates selected - Use Close to book'
                        }
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons - Full width on mobile */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button 
                    onClick={handleRelease}
                    disabled={!startDate || !isSelectedDateBooked()}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${
                      startDate && isSelectedDateBooked()
                        ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Release Booking
                  </button>
                  <button 
                    onClick={handleClose}
                    disabled={!startDate || isSelectedDateBooked()}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${
                      startDate && !isSelectedDateBooked()
                        ? 'bg-gray-600 hover:bg-gray-700 text-white cursor-pointer' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Close Dates
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardPage; 