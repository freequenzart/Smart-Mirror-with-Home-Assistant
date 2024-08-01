
class DVBCard extends HTMLElement {

    // Whenever the state changes, a new `hass` object is set. Use this to
    // update your content.
    set hass(hass) {

        // set up shadowDom first
        if (!this.shadowDomInit) {
            return;
        }

        const entities = this.config.entities;
        const data     = hass.states[entities[0]];
        // render changes
        this.setStopName(data);
        this.renderDepatures(data);
    }

    setStopName(data) {
        this.$stop.innerHTML = data.attributes.friendly_name;

        if(!this.config.show_title) {
            this.$stop.classList.add('hidden');
        }
    }

    renderDepatures(data) {
        const maxEntries = this.config.max_entries || 10;
        const departures = data.attributes.departures.slice(0, maxEntries).map((departure) => {
            return `
            <div class="departure">
                <div class="line">
                    <div class="line-icon">${departure.line_name}</div>
                    ${departure.line_type == 'CityBus'
                        ? `<ha-icon icon="mdi:bus-side"></ha-icon>`
                        : `<ha-icon icon="mdi:tram-side"></ha-icon>`
                    } 
                    <!--<div class="line-pl">${departure.platform}</div>-->
                </div>
                <div class="direction">${departure.direction}</div>
                <div class="time-slot">
                    ${departure.gap < 10
                        ? `<div class="todeparture">In ${departure.gap} min</div>`
                        : `<div class="time">${departure.time}</div>`
                    } 
                    
                </div>
            </div>
        `;
        });
        
        // add header
        departures.unshift(
            `
            <div class="departure">
                <div class="line">Linie</div>
                <div class="direction">Richtung</div>
                <div class="time-slot">Abfahrt</div>
                </div>
            </div>
            `
        );

        this.$departures.innerHTML = departures.join('');
    }

    // The user supplied configuration. Throw an exception and Home Assistant
    // will render an error card.
    setConfig(config) {
        if (!config.entities) {
            throw new Error('You need to define at liest an entity');
        }
        this.config = config;
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    getCardSize() {
        return 5;
    }


    // setup basic card content  and functions
    connectedCallback() {
        this.template = document.createElement('template');
        this.template.innerHTML = `
          ${this.getStyles()}
          <ha-card>
            <div class="card-content">
              <div class="container">
                <div class="stop" id="stop"></div>
                <div class="departures" id="departures">

                </div>
              </div>
            </div>
          </ha-card>
        `;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(this.template.content.cloneNode(true));

        this.$stop = this.shadowRoot.querySelector('#stop');
        this.$departures = this.shadowRoot.querySelector('#departures');

        this.shadowDomInit = true;
    }

    getStyles() {
        return `
        <style>
            .container {
                padding: 10px;
                font-size: ${ this.config && this.config.container_font_size ? this.config.container_font_size : '14px' };
                display: flex;
                flex-direction: column;
            }
            .stop {
                font-size: ${ this.config && this.config.stop_font_size ? this.config.stop_font_size : '24px' };
                font-weight: 400;
                width: 100%;
                text-align: left;
                padding: 10px 0 5px 0;
            }
            .stop.hidden {
                display: none;
            }
            .departures {
                width: 100%;
                font-weight: 400;
                line-height: 1.5em;
                padding-bottom: 20px;
                display: flex;
                flex-direction: column;
            }
            .departure {
                padding-top: 10px;
                min-height: 28;
                display: flex;
                flex-wrap: nowrap;
                align-items: center;
                gap: 24px;
            }

            .line {
                min-width: 64px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .line-icon {
                display: inline-block;
                font-weight: 700;
                line-height: 1em;
                color: #FFFFFF;
                text-align: center;
                font-size: 1.2em;
            }

            .line-pl {
                border-radius: 5px;
                padding: 5px;
                font-size: 60%;
                font-weight: 600;
                line-height: 1em;
                color: #FFFFFF;
                text-align: center;
                background-color: gray;
            }
            .direction {
                align-self: center;
                flex-grow: 1;
                ${ this.config && this.config.max_size_direction ? 
                    `
                    max-width: ${ this.config.max_size_direction };
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    ` : '' };
            }
            .time {
                align-self: flex-start;
                padding-right: 0px;
                white-space: nowrap;
            }
            .todeparture {
                font-weight: 700;
                white-space: nowrap;
            }
            .time-slot {
                display: flex;
                align-items: center;
                justify-content: space-between;
                white-space: nowrap;
            }
        </style>
        `;
    }
}

customElements.define("dvb-card", DVBCard);
window.customCards = window.customCards || [];
window.customCards.push({
    type: "dvb-card",
    name: "DVB Karte",
    preview: false, // Optional - defaults to false
    description: "Karte zum Anzeigen der Abfarten." // Optional
});