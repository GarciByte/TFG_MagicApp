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
    path: "magic-chat", // Ruta del chat con la IA
    loadComponent: () => import("./pages/chat-with-ai/chat-with-ai.component").then((m) => m.ChatWithAiComponent),
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
    path: "admin-profile", // Ruta del perfil admin
    loadComponent: () => import("./pages/admin-profile/admin-profile.component").then((m) => m.AdminProfileComponent),
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
    path: 'forum', // Ruta del foro
    loadComponent: () => import('./pages/forum/forum.component').then(m => m.ForumComponent),
    pathMatch: 'full'
  },
  {
    path: 'thread-detail/:id', // Ruta dentro de un hilo del foro
    loadComponent: () => import('./pages/thread-detail/thread-detail.component').then(m => m.ThreadDetailComponent),
    pathMatch: 'full'
  },
  {
    path: 'create-thread', // Ruta para crear un hilo del foro
    loadComponent: () => import('./pages/create-thread/create-thread.component').then(m => m.CreateThreadComponent),
    pathMatch: 'full'
  },
  {
    path: "decks", // Ruta de Mazos
    loadComponent: () => import("./pages/deck/deck.component").then((m) => m.DeckComponent),
    pathMatch: "full",
  },
  {
    path: "create-deck", // Ruta de Crear Mazo
    loadComponent: () => import("./pages/create-deck/create-deck.component").then((m) => m.CreateDeckComponent),
    pathMatch: "full",
  },
  {
    path: "add-cards-deck", // Ruta de Añadir Cartas al Mazo
    loadComponent: () => import("./pages/add-cards-deck/add-cards-deck.component").then((m) => m.AddCardsDeckComponent),
    pathMatch: "full",
  },
  {
    path: "deck-cards-views", // Ruta de Ver Cartas del Mazo
    loadComponent: () => import("./pages/deck-cards-views/deck-cards-views.component").then((m) => m.DeckCardsViewsComponent),
    pathMatch: "full",
  },
  {
    path: "deck-view", // Ruta de Ver Mazo
    loadComponent: () => import("./pages/deck-view/deck-view.component").then((m) => m.DeckViewComponent),
    pathMatch: "full",
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];