import { Injectable } from '@angular/core';
import { Result } from '../models/result';
import { User } from '../models/user';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { IsAdmin } from '../models/is-admin';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private api: ApiService, private authService: AuthService,) { }

  // Obtener información de un usuario por su ID
  async getUserById(userId: number): Promise<Result<User>> {
    return this.api.get<User>(`User/${userId}`);
  }

  // Comprueba si el usuario actual tiene rol Admin
  async isAdmin(): Promise<Result<IsAdmin>> {
    return this.api.get<IsAdmin>(`User/is-admin`);
  }

  // Obtener avatares de usuarios
  async getUserAvatar(userId: number): Promise<string> {
    const currentUser = await this.authService.getUser();
    const apiImg = environment.apiImg;

    if (userId === currentUser.userId) {
      return apiImg + currentUser.avatarUrl;
    }

    try {
      const result = await this.getUserById(userId);

      if (result.success) {
        return apiImg + result.data.avatarUrl;

      } else {
        console.error("Error al obtener datos del usuario:", result.error);
        return "";
      }

    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      return "";
    }
  }

  // Buscar usuarios por nickname
  async searchUsers(nickname: string): Promise<Result<User[]>> {
    return this.api.get<User[]>(`User/search`, { nickname });
  }

  // Obtener todos los usuarios
  async getAllUsers(): Promise<Result<User[]>> {
    return this.api.get<User[]>(`User/allUsers`);
  }

  // Actualizar datos del usuario
  async updateUserProfile(formData: FormData): Promise<Result<any>> {
    return this.api.put<any>('User/modifyUser', formData, 'application/json');
  }

  // Modificar la contraseña del usuario
  async modifyPassword(newPassword: string): Promise<Result<any>> {
    const body = { newPassword: newPassword };
    return this.api.put<any>('User/modifyPassword', body, 'application/json');
  }

  // Modificar rol del usuario
  async modifyRole(userId: number, newRole: string): Promise<Result<any>> {
    const body = { userId: userId, newRole: newRole }
    return this.api.put<any>('User/modifyUserRole', body, 'application/json');
  }

  // Modificar prohibición de un usuario
  async modifyBan(userId: number, isBanned: boolean): Promise<Result<any>> {
    const body = { userId: userId, isBanned: isBanned }
    return this.api.put<any>('User/modifyUserBan', body, 'application/json');
  }

}