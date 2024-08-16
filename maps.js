"use strict";

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;
  
    constructor(coords, distance, duration) {
      this.coords = coords; // [lat, lng]
      this.distance = distance; // in km
      this.duration = duration; // in min
    }
  
    _setDescription() {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
     this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
       months[this.date.getMonth()]
     } ${this.date.getDate()}`;
   }
  
   click() {
     this.clicks++;
     }
  }
  
  class Running extends Workout {
    type = 'running';
  
    constructor(coords, distance, duration, cadence) {
      super(coords, distance, duration);
      this.cadence = cadence;
      this.calcPace();
      this._setDescription();
    }
  
    calcPace() {
      // min/km
      this.pace = this.duration / this.distance;
      return this.pace;
    }
  }
  
  class Cycling extends Workout {
    type = 'cycling';
  
    constructor(coords, distance, duration, elevationGain) {
      super(coords, distance, duration);
      this.elevationGain = elevationGain;
      // this.type = 'cycling';
      this.calcSpeed();
      this._setDescription();
    }
  
    calcSpeed() {
      // km/h
      this.speed = this.distance / (this.duration / 60);
      return this.speed;
    }
  }

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
  #map;
  #mapEvent;
#workouts = [] ;
#mapZoomLevel = 13 ;
  constructor() {
    this.getposition();
    form.addEventListener("submit", this.newworkout.bind(this));
    inputType.addEventListener("change", this.toggleelevation.bind(this));
    containerWorkouts.addEventListener('click',this.moveup.bind(this)) ;
  }

  getposition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.loadmap.bind(this),
        function () {
          alert("Could not get your current position");
        }
      );
    }
  }

  loadmap(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log(latitude, longitude);
    const coords = [latitude, longitude]; // giving the coordinates of current location

    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this.showform.bind(this)); // map event data will store here
    this.#workouts.forEach(work => {
        this.renderWorkoutMarker(work);
      });  

}

  showform(mape) {
    this.#mapEvent = mape; // Handling clicks on map
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  toggleelevation() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  newworkout(e) {
    e.preventDefault();
    // get data from the form 
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;    // data of latitude and longitude is storing // it gives the coordinates
      let workout ;
    //create workout for running and cycling
    if (type === 'running') {
        const cadence = +inputCadence.value;
  
        // Check if data is valid
        if (
           !Number.isFinite(distance) ||
           !Number.isFinite(duration) ||
           !Number.isFinite(cadence) )
            return alert('It should be a positive integer number') ;
         workout = new Running([lat,lng],distance,duration,cadence) ;
    }

   if(type === 'cycling') {
    const elevation = +inputElevation.value 
    if (
        !Number.isFinite(distance) ||
        !Number.isFinite(duration) ||
        !Number.isFinite(elevation) )
         return alert('It should be a positive integer number') ;
         workout = new Cycling([lat,lng],distance,duration,elevation) ;
   }

   this.#workouts.push(workout) ;

   // render workout 
   this.renderworkoutmarker(workout) ;

   this.renderWorkout(workout) ;


    // hide form and clear form data
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        "";
  }
     
    
    
  renderworkoutmarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className:`${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
      .openPopup();
  }
  

renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;

    form.insertAdjacentHTML('afterend', html);
  }
  moveup(e) {
    if (!this.#map) return;

    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    workout.click() ;
  }

}
const APP = new App();
