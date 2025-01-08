"use client";
import { Calendar, dateFnsLocalizer, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { format, parse, startOfWeek, getDay } from 'date-fns';
import trTR from 'date-fns/locale/tr';


const locales = {
  'tr-TR': trTR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});



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


  console.log("data" , data);

  return (
    <div className="bg-blue">
      <Calendar
        localizer={localizer}
        events={data}
        startAccessor="start"
        endAccessor="end"
        views={["week", "day", "month"]}
        view={view}
        step = {60}
        timeslots={1}
        style={{ height: "98%" }}
        onView={handleOnChangeView}
        min={new Date(0, 0, 0, 8, 0, 0)} // Sadece saat 8'i belirt
        max={new Date(0, 0, 0, 17, 0, 0)} // Sadece saat 17'yi belirt
        eventPropGetter={eventStyleGetter}
        components={{
          event: eventRender,
        }}
      />
    </div>
  );
};

export default BigCalendar;
