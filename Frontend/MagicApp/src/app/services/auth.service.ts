import { Injectable } from '@angular/core';
import { AuthRequest } from '../models/auth-request';
import { AuthResponse } from '../models/auth-response';
import { Result } from '../models/result';
import { User } from '../models/user';
import { ApiService } from './api.service';
import { WebsocketService } from './websocket.service';
import { StorageService } from './storage.service';
import { RefreshTokenRequest } from '../models/refresh-token-request';
import { RefreshTokenResult } from '../models/refresh-token-result';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly USER_KEY = 'user';
  private readonly TOKEN_KEY = 'jwtToken';
  private readonly REMEMBER_ME_KEY = 'rememberMe';

  constructor(
    private api: ApiService,
    private webSocketService: WebsocketService,
    private storageService: StorageService
  ) { }

  // Login si se recuerda la sesión
  async autoLogin(): Promise<void> {
    try {
      const rememberMe = await this.storageService.getObject<boolean>(this.REMEMBER_ME_KEY) ?? false;
      if (!rememberMe) {
        await this.logout();
        return;
      }

      const refreshSuccess = await this.refreshTokens();
      if (refreshSuccess) {

        try {
          await this.connectWebSocket();

        } catch (error) {
          console.error("Se ha producido un error al conectar el websocket:", error);
          await this.logout();
        }

      } else {
        await this.logout();
      }

    } catch (error) {
      console.error("Se ha producido un error:", error);
      await this.logout();
    }
  }

  // Registro
  async signup(formData: any): Promise<Result<any>> {
    return this.api.post<any>('Auth/Signup', formData);
  }

  // Iniciar sesión
  async login(authData: AuthRequest, rememberMe: boolean): Promise<Result<AuthResponse>> {
    const result = await this.api.post<AuthResponse>('Auth/login', authData);

    if (result.success) {
      const { accessToken, refreshToken, user } = result.data;
      this.api.accessToken = accessToken;

      // Guardar tokens
      await this.storageService.saveObject(this.TOKEN_KEY, { accessToken, refreshToken });

      // Guardar datos del usuario
      await this.storageService.saveObject(this.USER_KEY, user);

      // Recordar sesión
      await this.storageService.saveObject(this.REMEMBER_ME_KEY, rememberMe);

      try {
        await this.connectWebSocket();

      } catch (error) {
        console.error("Se ha producido un error al conectar el websocket:", error);
        await this.logout();
        return null;
      }
    }

    return result;
  }

  // Conexión con el WebSocket
  async connectWebSocket() {
    return this.webSocketService.connectRxjs(this.api.accessToken, await this.isAuthenticated());
  }

  // Comprobar si el usuario está logeado
  async isAuthenticated(): Promise<boolean> {
    const tokens = await this.storageService.getObject<{ accessToken: string; refreshToken: string }>(this.TOKEN_KEY);
    return !!tokens?.accessToken && !!tokens?.refreshToken && !!this.api.accessToken?.trim();
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      this.webSocketService.disconnectRxjs();
      await this.storageService.removeObject(this.TOKEN_KEY);
      await this.storageService.removeObject(this.USER_KEY);
      await this.storageService.removeObject(this.REMEMBER_ME_KEY);
      this.api.accessToken = null;

    } catch (error) {
      console.error("Error durante logout:", error);
    }
  }

  // Obtener datos del usuario logeado
  async getUser(): Promise<User | null> {
    return await this.storageService.getObject<User>(this.USER_KEY);
  }

  // Refrescar el token
  async refreshTokens(): Promise<boolean> {
    const tokens = await this.storageService.getObject<{ accessToken: string; refreshToken: string; }>(this.TOKEN_KEY);

    if (!tokens?.refreshToken) {
      await this.logout();
      return false;
    }

    try {
      const request: RefreshTokenRequest = { refreshToken: tokens.refreshToken };
      const response = await this.api.post<RefreshTokenResult>('Auth/refresh', request);

      if (response.success) {
        await this.storageService.saveObject(this.TOKEN_KEY, response.data);
        this.api.accessToken = response.data.accessToken;
        console.log("Tokens refrescados con éxito.");
        return true;
      }

      await this.logout();
      return false;

    } catch (error) {
      console.error("Error renovando tokens:", error);
      await this.logout();
      return false;
    }
  }

}