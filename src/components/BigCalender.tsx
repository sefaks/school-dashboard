"use client";
import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);

const BigCalendar = ({
  data,
}: {
  data: { title: string; start: Date; end: Date }[];
}) => {
  const [view, setView] = useState<View>(Views.WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = 'white';
    const lessonTitle = event.title.trim();

    if (lessonTitle === 'Sosyal Bilgiler') {
      backgroundColor = 'lightblue';
    } else if (lessonTitle === 'Matematik') {
      backgroundColor = 'lightgreen';
    } else if (lessonTitle === 'Fen Bilgisi') {
      backgroundColor = 'lightyellow';
    } else if (lessonTitle === 'Türkçe') {
      backgroundColor = 'lightpink';
  
    } else {
      backgroundColor = 'lightgray';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        color: 'black',
      },
    };
  };

  const eventRender = (event: any) => {
    const lessonTitle = event.title.trim();
    
    return (
      <div className="display flex-col">
        <div className="rbc-event-content">{lessonTitle}</div>
      </div>
    );
  };

  return (
    <div className="bg-blue">
      <Calendar
        localizer={localizer}
        events={data}
        startAccessor="start"
        endAccessor="end"
        views={["week", "day", "month"]}
        view={view}
        style={{ height: "98%" }}
        onView={handleOnChangeView}
        min={new Date(2025, 1, 0, 8, 0, 0)}
        max={new Date(2025, 1, 0, 17, 0, 0)}
        eventPropGetter={eventStyleGetter}
        components={{
          event: eventRender,
        }}
      />
    </div>
  );
};

export default BigCalendar;