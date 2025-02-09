export const ITEM_PER_PAGE = 10

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
  "/list/analysis": ["admin", "teacher"],
  "/list/resources": ["admin", "teacher"],
  "/list/announcements": ["admin", "teacher"],
};