import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Result } from '../models/result';
import { Report, ReportStatus } from '../models/report';
import { NewReport } from '../models/new-report';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private api: ApiService) { }

  // Obtener todos los reportes
  async getAllReports(): Promise<Result<Report[]>> {
    return this.api.get<Report[]>('Report/allReports');
  }

  // Obtener un reporte por su ID
  async getReportById(id: number): Promise<Result<Report>> {
    return this.api.get<Report>(`Report/${id}`);
  }

  // Obtener todos los reportes realizados por un usuario específico
  async getReportsByReporter(reporterId: number): Promise<Result<Report[]>> {
    return this.api.get<Report[]>(`Report/by-reporter/${reporterId}`);
  }

  // Obtener todos los reportes donde un usuario ha sido reportado
  async getReportsByReportedUser(reportedUserId: number): Promise<Result<Report[]>> {
    return this.api.get<Report[]>(`Report/by-reported/${reportedUserId}`);
  }

  // Crear un nuevo reporte
  async createReport(newReport: NewReport): Promise<Result<Report>> {
    return this.api.post<Report>('Report', newReport, 'application/json');
  }

  // Actualizar el estado de un reporte
  async updateReportStatus(id: number, status: ReportStatus): Promise<Result<Report>> {
    return this.api.put<Report>(`Report/${id}/status`, status, 'application/json');
  }

  // Eliminar un reporte
  async deleteReport(id: number): Promise<Result<void>> {
    return this.api.delete<void>(`Report/${id}`);
  }

}