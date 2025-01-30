import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http:HttpClient) { }

  // private API_URL = 'http://localhost:3000'
  private API_URL = '__API_URL__'; 
  getMessage(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.API_URL}`);
  }
}
