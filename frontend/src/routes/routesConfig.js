export const routesByRole = {
  owner: [
    { path: "/dashboard", label: "Dashboard", name: "Dashboard" },

    { path: "/users", label: "Users", name: "Workers Management" },

    { path: "/tables", label: "Tables", name: "Tables Management" },

    { path: "/menus", label: "Menus", name: "Menus Management" },

    { path: "/order", label: "Order", name: "Order" },
  ],

  worker: [
    { path: "/order", label: "Order", name: "Order" },
  ],
};
