import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEvents } from "../store/eventSlice";
import { fetchEventDetails } from "../store/eventDetailsSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import NavLogo from "../assets/file.png";
import Profile from "../assets/profile1.jpg";
import { RiDashboard2Line } from "react-icons/ri";
import { TbLogout } from "react-icons/tb";
import { MdEventNote } from "react-icons/md";
import { IoIosCreate } from "react-icons/io";
import { LuMonitorPause } from "react-icons/lu";
import { IoIosCloseCircle } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./Dashboard.css";
import DashHome from "./DashHome";
import { useMemo } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Student Participants in Events",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      min: 0,
      max: 400,
      ticks: {
        stepSize: 1,
      },
      grid: {
        display: true,
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

function Dashboard() {
  const [barShow, setBarShow] = useState(true);
  const [createdAtttendance, setCreateAttendace] = useState(true);
  const [showEventList, setShowEventList] = useState(true);
  const [showQrData, setShowQrData] = useState(true);
  const [scanData, setScanData] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [combinedData, setCombinedData] = useState(null);
  const [showDataResult, setShowDataResult] = useState(true);
  const [result, setResult] = useState("No result");
  const [scannedData, setScannedData] = useState([]);
  const [historyShow, setHistoryShow] = useState(true);
  const [dashHomeShow, setDashHomeShow] = useState(true);
  const [filterBy, setFilterBy] = useState(["all"]);
  const [pendingFilter, setPendingFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);
   const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historySearchResult, setHistorySearchResult] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupEventDetails, setPopupEventDetails] = useState(null);

  const [formData, setFormData] = useState({
    eventTitle: "",
    dueDate: "",
    timeLimit: "",
    releaseDate: "",
  });

  const [barSelectedEventDetails, setBarSelectedEventDetails] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);
  const {
    event: eventDetails,
    loading: detailsLoading,
    error: detailsError,
  } = useSelector((state) => state.eventDetails);

  const { eventTitle, participants = [] } = eventDetails || {};
  const [expandedEvent, setExpandedEvent] = useState(null);

  console.log("Event Details:", eventDetails);

  const [barData, setBarData] = useState(null);
  const [barLoading, setBarLoading] = useState(true);
  const [barError, setBarError] = useState(null);

  const chartRef = useRef(null);

  useEffect(() => {
    if (!showEventList) {
      dispatch(fetchEvents());
    }
  }, [dispatch, showEventList]);

  useEffect(() => {
    const fetchParticipantCounts = async () => {
      if (!events || events.length === 0) {
        setBarData(null);
        setBarLoading(false);
        return;
      }
      try {
        setBarLoading(true);
        const counts = await Promise.all(
          events.map(async (event) => {
            const response = await dispatch(
              fetchEventDetails(event.eventTitle)
            );

            if (response.meta.requestStatus === "fulfilled") {
              const details = response.payload;
              return {
                eventTitle: details.eventTitle,
                participantCount: details.participants.length,
              };
            } else {
              console.error(
                `Failed to fetch details for event: ${event.eventTitle}`
              );
              return {
                eventTitle: event.eventTitle,
                participantCount: 0,
              };
            }
          })
        );

        const labels = counts.map((item) => item.eventTitle);
        const data = counts.map((item) => item.participantCount);

        setBarData({
          labels,
          datasets: [
            {
              label: "Number of Student Participants",
              data,
              backgroundColor: "rgba(0, 128, 0, 0.6)",
            },
          ],
        });
        setBarLoading(false);
      } catch (err) {
        console.error("Error fetching participant counts:", err);
        setBarError("Failed to load bar graph data.");
        setBarLoading(false);
      }
    };
    fetchParticipantCounts();
  }, [dispatch, events]);

  const handleLogout = () => {
    fetch("https://ssc-backend.onrender.com/api/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          navigate("/");
        } else {
          console.error("Failed to log out");
        }
      })
      .catch((error) => {
        console.error("Error", error);
      });
  };

  const handleBarShow = (event) => {
    setBarShow(false);
    setCreateAttendace(true);
    setShowEventList(true);
    setShowQrData(true);
    setHistoryShow(true);
    setDashHomeShow(false);
    setBarSelectedEventDetails(null);
  };

  const handleCreateAttendanceShow = () => {
    setCreateAttendace(false);
    setBarShow(true);
    setShowEventList(true);
    setShowQrData(true);
    setHistoryShow(true);
    setDashHomeShow(false);
  };

  const handleShowEventList = () => {
    setShowEventList(false);
    setCreateAttendace(true);
    setBarShow(true);
    setShowQrData(true);
    setHistoryShow(true);
    setDashHomeShow(false);
  };

  const handleDataQrShow = () => {
    setShowQrData(!showQrData);
  };

  const handleDataQrClose = () => {
    setShowQrData(true);
    setScanData("");
    setSelectedEvent(null);
    setCombinedData(null);
    setScannedData([]);
  };

  const handleHistoryShow = () => {
    setHistoryShow(false);
    setBarShow(true);
    setCreateAttendace(true);
    setShowEventList(true);
    setShowQrData(true);
    setDashHomeShow(false);
  };

  const handleDashHomeShow = () => {
    setDashHomeShow(true);
    setBarShow(true);
    setCreateAttendace(true);
    setShowEventList(true);
    setShowQrData(true);
    setHistoryShow(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  function formatDateTime(datetimeStr) {
    const date = new Date(datetimeStr);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    const formattedDueDate = formatDateTime(formData.dueDate);
    const formattedReleaseDate = formatDateTime(formData.releaseDate);

    const [hours, minutes] = formData.timeLimit.split(":");
    const timeLimitDate = new Date();
    timeLimitDate.setHours(hours, minutes);
    const formattedTimeLimit = timeLimitDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    fetch("https://ssc-backend.onrender.com/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTitle: formData.eventTitle,
        dueDate: formattedDueDate,
        releaseDate: formattedReleaseDate,
        timeLimit: formattedTimeLimit,
      }),
    })
      .then((response) => {
        if (response.ok) {
          toast.success("Event created succcessfully!", {
            position: "top-center",
            autoClose: 1000,
          });
          resetEventForm();
          dispatch(fetchEvents());
        } else {
          toast.error("Failed to create event", data, {
            position: "top-center",
            autoClose: 1000,
          });
        }
      })
      .catch((error) => {
        console.error("Error", error);
      });
  };

  const resetEventForm = () => {
    setFormData({
      eventTitle: "",
      dueDate: "",
      timeLimit: "",
      releaseDate: "",
    });
  };

  const onScanResult = async (parsedData) => {
    return false;
  };

  const handleViewClick = (event) => {
    console.log("Opened event:", event.eventTitle);
    setSelectedEvent(event);
    handleDataQrShow();
    setCombinedData(null);
    setScannedData([]);
    setShowDataResult(!showDataResult);
    dispatch(fetchEventDetails(event.eventTitle));
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        if (!selectedEvent) {
          console.warn("No event selected for scanning.");
          setResult("No event selected");
          setScanData("");
          return;
        }

        try {
          const parsedData = JSON.parse(scanData);
          onScanResult(parsedData)
            .then((isDuplicate) => {
              if (isDuplicate) {
                toast.error("This QR code has already been scanned.", {
                  position: "top-center",
                });
                setResult("Already scanned");
              } else {
                setResult("Scan done");

                const existingParticipant = scannedData.find(
                  (data) =>
                    data.studentId === parsedData.studentId &&
                    data.eventTitle === selectedEvent.eventTitle
                );

                if (existingParticipant) {
                  toast.warning("Participant already scanned for this event.", {
                    position: "top-center",
                  });
                  setResult("Participant already scanned for this event");
                } else {
                  const scanTime = new Date().toLocaleString("en-PH", {
                    timeZone: "Asia/Manila",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  });

                  const newEntry = {
                    eventTitle: selectedEvent.eventTitle,
                    name: parsedData.fullname,
                    gender: parsedData.gender,
                    course: parsedData.course,
                    studentId: parsedData.studentId,
                    year: parsedData.year,
                    time: scanTime,
                  };

                  fetch("https://ssc-backend.onrender.com/api/scanEvent", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newEntry),
                  })
                    .then((response) => {
                      if (!response.ok) {
                        throw new Error("Network response was not ok");
                      }
                      return response.json();
                    })
                    .then((data) => {
                      console.log(data);
                      setScannedData((prevData) => [...prevData, newEntry]);

                      toast.success("Scan successful! Points added.", {
                        position: "top-center",
                        autoClose: 1000,
                      });
                    })
                    .catch((error) => {
                      console.error("Error", error);
                      toast.error("Error processing scan result", {
                        position: "top-center",
                      });
                    });
                }
              }
            })
            .catch((error) => {
              console.error("Error processing scan result:", error);
              setResult("Invalid QR code data");
              toast.error("Invalid QR code data", {
                position: "top-center",
              });
            });
          setScanData("");
        } catch (error) {
          console.error("Error parsing JSON:", error);
          setResult("Invalid QR code data");
          toast.error("Invalid QR code data", {
            position: "top-center",
          });
        }
      } else {
        setScanData((prevData) => prevData + event.key);
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [scanData, selectedEvent, scannedData]);

  const handleBarClick = useCallback(
    async (event) => {
      if (!chartRef.current) return;

      const chart = chartRef.current;
      const elements = chart.getElementsAtEventForMode(
        event,
        "nearest",
        { intersect: true },
        false
      );

      console.log("Bar Clicked:", { chartEvent: event, elements, chart });

      if (!elements.length) return;

      const firstElement = elements[0];
      const index = firstElement.index;
      const eventTitle = barData.labels[index];
      console.log("Selected Event Title:", eventTitle);

      const selectedEvent = events.find((e) => e.eventTitle === eventTitle);
      console.log("Selected Event:", selectedEvent);

      if (selectedEvent) {
        try {
          const response = await dispatch(fetchEventDetails(eventTitle));
          if (response.meta.requestStatus === "fulfilled") {
            const groupedByCourse = response.payload.participants.reduce(
              (acc, participant) => {
                const course = participant.course;
                if (!acc[course]) {
                  acc[course] = [];
                }
                acc[course].push(participant);
                return acc;
              },
              {}
            );
            setSelectedEvent({
              groupedByCourse,
              totalParticipants: response.payload.participants.length,
            });

            setBarSelectedEventDetails(response.payload);
          } else {
            toast.error(`Failed to fetch details for ${eventTitle}`, {
              position: "top-center",
              autoClose: 2000,
            });
          }
        } catch (error) {
          console.error("Error fetching event details:", error);
          toast.error("An error occurred while fetching event details.", {
            position: "top-center",
            autoClose: 2000,
          });
        }
      }
    },
    [barData, dispatch, events]
  );

 const handleEventClick = (eventTitle) => {
    console.log(`Fetching details for event: ${eventTitle}`);
    dispatch(fetchEventDetails(eventTitle));
    setPopupEventDetails(eventTitle);
    setIsPopupVisible(true);
  };

  const handleFilterChange = () => {
    setFilterBy((prevFilters) => {
      if (pendingFilter === "all") {
        return ["all"];
      }

      const newFilters =
        !prevFilters.includes(pendingFilter) && pendingFilter !== "all"
          ? [...prevFilters.filter((f) => f !== "all"), pendingFilter]
          : prevFilters.filter((f) => f !== pendingFilter);

      return newFilters.length === 0 ? ["all"] : newFilters;
    });
  };

  const handleSearch = () => {
    if (!barSelectedEventDetails?.participants || searchQuery.trim() === "") {
      setSearchResult([]);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();

    const results = barSelectedEventDetails.participants.filter(
      (participant) => {
        const exactMatchFields = ["gender"];
        const partialMatchFields = ["name", "course", "studentId", "year"];

        const exactMatch = exactMatchFields.some((field) => {
          return (
            participant[field] &&
            String(participant[field]).toLowerCase() === lowerCaseQuery
          );
        });

        const partialMatch = partialMatchFields.some((field) => {
          return (
            participant[field] &&
            String(participant[field]).toLowerCase().includes(lowerCaseQuery)
          );
        });

        return exactMatch || partialMatch;
      }
    );

    setSearchResult(results);
  };

  const getFilteredParticipants = () => {
    if (!barSelectedEventDetails?.participants) return [];
    if (filterBy.includes("all")) return barSelectedEventDetails.participants;

    return barSelectedEventDetails.participants.map((participant) => {
      const filteredData = {};
      filterBy.forEach((filter) => {
        if (participant[filter]) {
          filteredData[filter] = participant[filter];
        }
      });
      return { ...filteredData, _id: participant._id };
    });
  };

  const filteredParticipants = getFilteredParticipants();
  const participantsToDisplay =
    searchResult.length > 0 ? searchResult : filteredParticipants;
  /*
const handleFilterChange = (e) => {
  setFilterBy(e.target.value);
};

const getFilteredParticipants = () => {
  if (!barSelectedEventDetails?.participants) return [];
  if (filterBy === "all") return barSelectedEventDetails.participants;

  return barSelectedEventDetails.participants.map((participant) => {
    return { [filterBy]: participant[filterBy], _id: participant._id };
  });
};

const filteredParticipants = getFilteredParticipants();

*/

  const handleDownloadPDF = (eventTitle, participant) => {
    const doc = new jsPDF();
    const tableColumn = ["Name", "Student ID", "Course", "Year", "Time"];
    const tableRows = participant.map((participant) => [
      participant.name,
      participant.gender,
      participant.studentId,
      participant.course,
      participant.year,
      participant.time,
    ]);

    doc.text(`Event: ${eventTitle}`, 14, 10);

    doc.autoTable({
      heade: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`${eventTitle}.pdf`);
  };

  const handlePrint = (eventTitle) => {
    const printContents = document.getElementById("print-section").innerHTML;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.open();
    printWindow.document.write(
      `
    <html>
      <head>
        <title>Print Event: ${eventTitle}</title>
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h2>${eventTitle}</h2>
        ${printContents}
      </body>
    </html>
  `
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

   const handleHistorySearch = () => {
    if (!eventDetails?.participants || historySearchQuery.trim() === "") {
      setHistorySearchResult([]);
      return;
    }

    const lowerCaseQuery = historySearchQuery.toLowerCase();

    const results = eventDetails.participants.filter((participant) => {
      const exactMatchFields = ["gender"];
      const partialMatchFields = ["name", "course", "studentId", "year"];

      const exactMatch = exactMatchFields.some((field) => {
        return (
          participant[field] &&
          String(participant[field]).toLowerCase() === lowerCaseQuery
        );
      });

      const partialMatch = partialMatchFields.some((field) => {
        return (
          participant[field] &&
          String(participant[field]).toLowerCase().includes(lowerCaseQuery)
        );
      });

      return exactMatch || partialMatch;
    });

    setHistorySearchResult(results);
  };

  const handleClearSearch = () => {
    setHistorySearchQuery("");
    setHistorySearchResult([]);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setPopupEventDetails(null);
  };
  return (
     <div className={`main ${isPopupVisible ? "blur-background" : ""}`}>
      <header className="header">
        <nav className="nav">
          <img src={NavLogo} alt="NavLogo" className="navlogo" />
          <img src={Profile} alt="profile" className="profile" />
        </nav>
      </header>
      <main className="main-content">
        <div className="side-content">
          <div onClick={handleDashHomeShow} className="side-content-label">
            <FaHome size={40} color="red" className="icons" />
            <p className="home">Home</p>
          </div>
          <div onClick={handleShowEventList} className="side-content-label">
            <MdEventNote size={40} color="green" className="icons" />
            <p className="scan">Scan Participant</p>
          </div>
          <div onClick={handleBarShow} className="side-content-label">
            <RiDashboard2Line size={40} color="#f96d00" className="icons" />
            <p className="vis">Visualization</p>
          </div>
          <div
            onClick={handleCreateAttendanceShow}
            className="side-content-label"
          >
            <IoIosCreate size={40} color="#596e79" className="icons" />
            <p className="create">Create Event</p>
          </div>
          <div onClick={handleHistoryShow} className="side-content-label">
            <LuMonitorPause size={40} color="#b5592a" className="icons" />
            <p className="evehistory">Events History</p>
          </div>
          <div onClick={handleLogout} className="side-content-label">
            <TbLogout size={40} color="red" className="icons" />
            <p className="logout-p">Logout</p>
          </div>
        </div>
        {dashHomeShow && (
          <div className="dash-home">
            <DashHome />
          </div>
        )}
        {!barShow && (
          <div>
            <div className="barGrap">
              {barLoading ? (
                <p>Loading bar graph...</p>
              ) : barError ? (
                <p>{barError}</p>
              ) : barData ? (
                <Bar
                  ref={chartRef}
                  data={barData}
                  options={options}
                  className="bar"
                  onClick={handleBarClick}
                />
              ) : (
                <p>No events to display in the bar graph.</p>
              )}
            </div>

            <div className="user-indicator">
              <div className="user-content">
                {barSelectedEventDetails ? (
                  <div className="user-content-details">
                    <h3>
                      Participants for {barSelectedEventDetails.eventTitle}
                    </h3>
                    <div className="user-content-div">
                      <select
                        name="filter"
                        value={pendingFilter}
                        onChange={(e) => setPendingFilter(e.target.value)}
                      >
                        <option value="all">Show All</option>
                        <option value="name">Name</option>
                        <option value="gender">Gender</option>
                        <option value="course">Course</option>
                        <option value="studentId">Student ID</option>
                        <option value="year">Year</option>
                        <option value="time">Time</option>
                      </select>
                      <button onClick={handleFilterChange}>Filter</button>

                      <input
                        type="text"
                        placeholder="Search by ID, name, course, or year"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button onClick={handleSearch}>Search</button>
                    </div>

                    {participantsToDisplay &&
                    participantsToDisplay.length > 0 ? (
                      <div className="participant-table-container">
                        <table className="participant-table">
                          <thead>
                            <tr>
                              {filterBy.includes("all") ||
                              filterBy.includes("name") ? (
                                <th>Name</th>
                              ) : null}
                              {filterBy.includes("all") ||
                              filterBy.includes("gender") ? (
                                <th>Gender</th>
                              ) : null}
                              {filterBy.includes("all") ||
                              filterBy.includes("course") ? (
                                <th>Course</th>
                              ) : null}
                              {filterBy.includes("all") ||
                              filterBy.includes("studentId") ? (
                                <th>Student ID</th>
                              ) : null}
                              {filterBy.includes("all") ||
                              filterBy.includes("year") ? (
                                <th>Year</th>
                              ) : null}
                              {filterBy.includes("all") ||
                              filterBy.includes("time") ? (
                                <th>Time</th>
                              ) : null}
                            </tr>
                          </thead>
                          <tbody>
                            {participantsToDisplay.map((participant) => (
                              <tr key={participant._id}>
                                {filterBy.includes("all") ||
                                filterBy.includes("name") ? (
                                  <td>{participant.name}</td>
                                ) : null}
                                {filterBy.includes("all") ||
                                filterBy.includes("gender") ? (
                                  <td>{participant.gender}</td>
                                ) : null}
                                {filterBy.includes("all") ||
                                filterBy.includes("course") ? (
                                  <td>{participant.course}</td>
                                ) : null}
                                {filterBy.includes("all") ||
                                filterBy.includes("studentId") ? (
                                  <td>{participant.studentId}</td>
                                ) : null}
                                {filterBy.includes("all") ||
                                filterBy.includes("year") ? (
                                  <td>{participant.year}</td>
                                ) : null}
                                {filterBy.includes("all") ||
                                filterBy.includes("time") ? (
                                  <td>{participant.time}</td>
                                ) : null}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p>No participants found for this event.</p>
                    )}
                  </div>
                ) : (
                  <p>Click on a bar to see participants.</p>
                )}
              </div>
            </div>

            {/*fix that return a card and display total*/}
            <div className="courses">
              {selectedEvent &&
              selectedEvent.groupedByCourse &&
              Object.keys(selectedEvent.groupedByCourse).length > 0 ? (
                <div className="course-cards-container">
                  {Object.entries(selectedEvent.groupedByCourse).map(
                    ([courseName, participants]) => (
                      <div key={courseName} className="course-card">
                        <h3>{courseName}</h3>
                        <p>Participants: {participants.length}</p>
                      </div>
                    )
                  )}

                  <div className="total-card">
                    <h3>Total Participants</h3>
                    <p>{selectedEvent.totalParticipants}</p>
                  </div>
                </div>
              ) : (
                <p>No course data available.</p>
              )}
            </div>
          </div>
        )}
        {!createdAtttendance && (
          <div className="create-main">
            <div className="create-child">
              <form onSubmit={handleFormSubmit}>
                <label>Event Title</label>
                <input
                  type="text"
                  placeholder="Enter event title"
                  name="eventTitle"
                  value={formData.eventTitle}
                  onChange={handleInputChange}
                  required
                />
                <label>Due Date</label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
                <label>Time Limit</label>
                <input
                  type="time"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleInputChange}
                  required
                />
                <label>Release Date</label>
                <input
                  type="datetime-local"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  required
                />

                <button type="submit">Create event</button>
              </form>
            </div>
          </div>
        )}
        {!showEventList && (
          <div className="event-list">
            {loading && <p>Loading events...</p>}
            {error && <p>Error loading events: {error}</p>}
            {!loading && !error && events.length > 0 ? (
              events.map((event) => (
                <div key={event._id} className="event-cards">
                  <p>{event.eventTitle || "Untitled Event"}</p>
                  <button onClick={() => handleViewClick(event)}>View</button>
                </div>
              ))
            ) : (
              <p>No events available</p>
            )}
          </div>
        )}

        {!showQrData && selectedEvent && (
          <div className="event-qr-main">
            <IoIosCloseCircle
              className="qr-data-exit"
              onClick={handleDataQrClose}
              size={30}
              color="#dc2f2f"
            />
            <div className="event-qr-data">
              {scannedData.length > 0 ? (
                <div className="qr-data-result">
                  <table className="scanned-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Course</th>
                        <th>Student ID</th>
                        <th>Year</th>
                        <th>Date and Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scannedData.map((data, index) => (
                        <tr key={index}>
                          <td>{data.eventTitle}</td>
                          <td>{data.name}</td>
                          <td>{data.gender}</td>
                          <td>{data.course}</td>
                          <td>{data.studentId}</td>
                          <td>{data.year}</td>
                          <td>{data.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                !eventDetails && <p>No participants scanned yet.</p>
              )}

              {participants.length > 0 ? (
                <div className="qr-data-result">
                  <table className="scanned-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Course</th>
                        <th>Student ID</th>
                        <th>Year</th>
                        <th>Date and Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant) => (
                        <tr key={participant._id}>
                          <td>{participant.eventTitle || eventTitle}</td>
                          <td>{participant.name}</td>
                          <td>{participant.gender}</td>
                          <td>{participant.course}</td>
                          <td>{participant.studentId}</td>
                          <td>{participant.year}</td>
                          <td>{participant.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                eventDetails && <p>No event details available.</p>
              )}
            </div>
          </div>
        )}

        {!historyShow && (
          <div className="history">
            <h2>Event History</h2>
            {events.map((eventItem) => (
              <div key={eventItem._id} className="event-history">
                <div>
                  <div className="history-titles">
                    <h3 onClick={() => handleEventClick(eventItem.eventTitle)}>
                      {eventItem.eventTitle}
                    </h3>
                  </div>
                  {expandedEvent === eventItem.eventTitle && (
                    <div className="participants-history">
                      {loading ? (
                        <p>Loading participants...</p>
                      ) : error ? (
                        <p>Error: {error}</p>
                      ) : eventDetails &&
                        eventDetails.participants &&
                        eventDetails.participants.length > 0 ? (
                        <>
                          <div id="print-section">
                            <table className="history-table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Gender</th>
                                  <th>Student ID</th>
                                  <th>Course</th>
                                  <th>Year</th>
                                  <th>Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(historySearchResult.length > 0
                                  ? historySearchResult
                                  : eventDetails.participants
                                ).map((participant) => (
                                  <tr key={participant._id}>
                                    <td>{participant.name}</td>
                                    <td>{participant.gender}</td>
                                    <td>{participant.studentId}</td>
                                    <td>{participant.course}</td>
                                    <td>{participant.year}</td>
                                    <td>{participant.time}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <button
                            onClick={() =>
                              handleDownloadPDF(
                                eventItem.eventTitle,
                                historySearchResult.length > 0
                                  ? historySearchResult
                                  : eventDetails.participants
                              )
                            }
                          >
                            Download PDF
                          </button>
                          <button
                            onClick={() => handlePrint(eventItem.eventTitle)}
                            className="print-btn"
                          >
                            Print
                          </button>
                          <input
                            type="text"
                            placeholder="Search by ID, name, course, or year"
                            value={historySearchQuery}
                            onChange={(e) =>
                              setHistorySearchQuery(e.target.value)
                            }
                          />
                          <button onClick={handleClearSearch}>Clear</button>
                          <button onClick={handleHistorySearch}>Search</button>
                        </>
                      ) : (
                        <p>No participants found</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {isPopupVisible && (
        <div className="popup">
          <div className="popup-content">
            <RxExitFullScreen
              size={30}
              color="red"
              className="close-popup"
              onClick={handleClosePopup}
            />

            <h2>{popupEventDetails}</h2>
            <div className="history-func">
              <button
                onClick={() =>
                  handleDownloadPDF(
                    popupEventDetails,
                    historySearchResult.length > 0
                      ? historySearchResult
                      : eventDetails.participants
                  )
                }
              >
                Download PDF
              </button>
              <button
                onClick={() => handlePrint(popupEventDetails)}
                className="print-btn"
              >
                Print
              </button>
              <input
                type="text"
                placeholder="Search by ID, name, course, or year"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
              />
              <button onClick={handleClearSearch}>Clear</button>
              <button onClick={handleHistorySearch}>Search</button>
            </div>
            {eventDetails && eventDetails.participants && (
              <div id="print-section">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Student ID</th>
                      <th>Course</th>
                      <th>Year</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(historySearchResult.length > 0
                      ? historySearchResult
                      : eventDetails.participants
                    ).map((participant) => (
                      <tr key={participant._id}>
                        <td>{participant.name}</td>
                        <td>{participant.gender}</td>
                        <td>{participant.studentId}</td>
                        <td>{participant.course}</td>
                        <td>{participant.year}</td>
                        <td>{participant.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
