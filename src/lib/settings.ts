export const ITEM_PER_PAGE = 5

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/teacher(.*)": ["teacher"],
  "/list/teachers": ["admin", "teacher"],
  "/list/students": ["admin", "teacher"],
  "/list/parents": ["admin", "teacher"],
  "/list/subjects": ["admin"],
  "/list/classes": ["admin", "teacher"],
  "/list/exams": ["admin", "teacher"],
  "/list/assignments": ["admin", "teacher"],
  "/list/results": ["admin", "teacher"],
  "/list/attendance": ["admin", "teacher"],
  "/list/events": ["admin", "teacher"],
  "/list/announcements": ["admin", "teacher"],
};