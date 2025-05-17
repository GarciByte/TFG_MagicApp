import type { Routes } from "@angular/router"

export const routes: Routes = [
  {
    path: "", // Ruta inicial
    loadComponent: () => import("./pages/home/home.component").then((m) => m.HomeComponent),
    pathMatch: "full",
  },
  {
    path: "login", // Ruta login
    loadComponent: () => import("./pages/login/login.component").then((m) => m.LoginComponent),
    pathMatch: "full",
  },
  {
    path: "signup", // Ruta registro
    loadComponent: () => import("./pages/signup/signup.component").then((m) => m.SignupComponent),
    pathMatch: "full",
  },
  {
    path: "menu", // Ruta menú principal
    loadComponent: () => import("./pages/menu/menu.component").then((m) => m.MenuComponent),
    pathMatch: "full",
  },
  {
    path: "global-chat", // Ruta del chat global
    loadComponent: () => import("./pages/global-chat/global-chat.component").then((m) => m.GlobalChatComponent),
    pathMatch: "full",
  },
  {
    path: "private-chat-list", // Ruta de la lista de chats privados
    loadComponent: () => import("./pages/private-chats-list/private-chats-list.component").then((m) => m.PrivateChatsListComponent),
    pathMatch: "full",
  },
  {
    path: "private-chat", // Ruta del chat privado con otro usuario
    loadComponent: () => import("./pages/private-chat/private-chat.component").then((m) => m.PrivateChatComponent),
    pathMatch: "full",
  },
  {
    path: "user-search", // Ruta del Buscador de usuarios
    loadComponent: () => import("./pages/user-search/user-search.component").then((m) => m.UserSearchComponent),
    pathMatch: "full",
  },
  {
    path: "user-profile", // Ruta del perfil del usuario
    loadComponent: () => import("./pages/user-profile/user-profile.component").then((m) => m.UserProfileComponent),
    pathMatch: "full",
  },
  {
    path: "other-users-profile", // Ruta del perfil de otro usuario
    loadComponent: () => import("./pages/other-users-profile/other-users-profile.component").then((m) => m.OtherUsersProfileComponent),
    pathMatch: "full",
  },
  {
    path: "card-search", // Ruta del buscador de cartas
    loadComponent: () => import("./pages/card-search/card-search.component").then((m) => m.CardSearchComponent),
    pathMatch: "full",
  },
  {
    path: 'card-details', // Ruta de detalles de una carta
    loadComponent: () => import('./pages/card-details/card-details.component').then(m => m.CardDetailsComponent),
    pathMatch: 'full'
  },
  {
    path: "mazos", // Ruta de Mazos
    loadComponent: () => import("./pages/mazos/mazos.component").then((m) => m.MazosComponent),
    pathMatch: "full",
  },
  {
    path: "crear-mazo", // Ruta de Crear Mazo
    loadComponent: () => import("./pages/crear-mazo/crear-mazo.component").then((m) => m.CrearMazoComponent),
    pathMatch: "full",
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];