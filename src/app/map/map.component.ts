import { Component } from '@angular/core';
import * as L from 'leaflet';
import { IMarker } from '../models/marker.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent {
  markers: IMarker[] = [];
  isEditing:boolean = false;
  private map!: L.Map;
  private markerInstances: L.Marker[] = []; // Almacenará las instancias de los marcadores en el mapa
  private editMode = false; // Para saber si estamos en modo edición
  private markerBeingEdited!: IMarker; // Almacena el marcador que estamos editando

  ngOnInit(): void {
    this.initMap();
    this.isEditing = false;
  }

  markerForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    message: new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    latitude: new FormControl<number>(0, [Validators.required]),
    longitude: new FormControl<number>(0, [Validators.required]),
  });

  addOrEditmarker(){
    if (this.isEditing){
      this.saveEditedMarker();
    }else{
      this.addNewMarker();
    }
  }

  // Método para agregar un nuevo marcador
  addNewMarker() {
    const marker: IMarker = {
      id: this.markers.length, // Usamos el tamaño del array como ID para el nuevo marcador
      latitude: this.markerForm.value.latitude ?? 0,
      longitude: this.markerForm.value.longitude ?? 0,
      message: this.markerForm.value.message ?? '',
      name: this.markerForm.value.name ?? '',
    };

    this.addMarker(marker);
    this.markers.push(marker);
  }

  // Método para inicializar el mapa
  private initMap(): void {
    this.map = L.map('map').setView([4.8128, -75.6961], 13); // Coordenadas iniciales y zoom

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Crear un marcador inicial (ejemplo)
    const marker: IMarker = {
      id: 0,
      latitude: 4.8128,
      longitude: -75.6961,
      message: '¡Aquí estoy!',
      name: 'MyUbication',
    };

    this.addMarker(marker);
    this.markers.push(marker);
  }

  // Método privado para agregar un marcador en el mapa
  private addMarker(marker: IMarker): void {
    const leafletMarker = L.marker([marker.latitude, marker.longitude])
      .addTo(this.map)
      .bindPopup(marker.message)
      .openPopup();

    this.markerInstances.push(leafletMarker); // Guardamos la referencia al marcador en el array
    this.cleanform();
  }

  // Método para eliminar un marcador por su ID
  deleteMarker(markerId: number): void {
    const markerIndex = this.markers.findIndex(m => m.id === markerId);
    if (markerIndex !== -1) {
      this.map.removeLayer(this.markerInstances[markerIndex]);
      this.markers.splice(markerIndex, 1);
      this.markerInstances.splice(markerIndex, 1);
    }
  }

  cleanform(){
    this.markerForm.reset();
    this.isEditing = false;
  }

  // Método para cargar el marcador en el formulario para editar
  editMarker(markerId: number): void {
    // Buscar el marcador por su ID
    this.isEditing = true;
    const markerToEdit = this.markers.find(m => m.id === markerId);
    if (markerToEdit) {
      this.markerForm.setValue({
        name: markerToEdit.name,
        message: markerToEdit.message,
        latitude: markerToEdit.latitude,
        longitude: markerToEdit.longitude,
      });
      this.markerBeingEdited = markerToEdit; // Guardamos el marcador que estamos editando
      this.editMode = true; // Activamos el modo de edición
    }
  }

  // Método para guardar los cambios del marcador editado
  saveEditedMarker(): void {

    if (this.markerBeingEdited) {
      const updatedMarker: IMarker = {
        ...this.markerBeingEdited, // Mantenemos el ID y las referencias
        name: this.markerForm.value.name!,
        message: this.markerForm.value.message!,
        latitude: this.markerForm.value.latitude!,
        longitude: this.markerForm.value.longitude!,
      };

      // Actualizamos los datos en la lista de marcadores
      const markerIndex = this.markers.findIndex(m => m.id === updatedMarker.id);
      if (markerIndex !== -1) {
        this.markers[markerIndex] = updatedMarker;
        // Actualizamos el marcador en el mapa
        const leafletMarker = this.markerInstances[markerIndex];
        leafletMarker.setLatLng([updatedMarker.latitude, updatedMarker.longitude]);
        leafletMarker.setPopupContent(updatedMarker.message);

        // Cerramos el modo de edición
        this.editMode = false;
        this.markerForm.reset(); // Limpiamos el formulario
      }
    }
    this.isEditing = false;
  }
}
