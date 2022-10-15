class DataBinding {
    constructor(data) {
        this._unproxedData = data || {};
        this.data = new Proxy(this._unproxedData, { set: (_obj, prop, value) => this.setValue(prop, value) || true });
        this.listenValues();
        this.onDataChange = () => { };
    }

    listenValues() {
        Array.from(document.querySelectorAll('input[data-value]')).forEach(input => {
            const prop = input.getAttribute('data-value');
            this.setValue(prop, this.readValue(input), input);

            input.addEventListener('input', () => {
                this.setValue(prop, this.readValue(input), input);
                this.onDataChange(prop, input.value);
            });
        });
    }

    setValue(prop, value, target) {
        this._unproxedData[prop] = value;
        for (const element of document.querySelectorAll(`[data-bind="${prop}"]`)) {
            if (element !== target) {
                this.writeValue(element, value)
            }
        }
    }

    readValue(input) {
        const type = input.getAttribute('type');
        if (type === 'number') { return +input.value; }
        return input.value;
    }

    writeValue(element, value) {
        if (element instanceof HTMLInputElement) {
            element.value = value;
        } else {
            element.innerHTML = value;
        }
    }
}

class Main {
    constructor() {
        console.log('DOM Loaded');
        this.data = new DataBinding();
        this.data.onDataChange = (prop, value) => {
            console.log(prop, value);
            this.calculate();
        }
        this.calculate();
    }

    calculate() {
        const { nicotineContent, fAromePrc, fNicotineContent, fVolume } = this.data.data;

        const finalVGPart = 0.7;
        const finalPGPart = 1 - finalVGPart;

        const fBaseWithNicoVolume = fVolume * fNicotineContent / nicotineContent;
        const fBaseVolume = finalVGPart * fVolume - fBaseWithNicoVolume;

        const fAromaVolume = fAromePrc / 100 * fVolume;
        const fPGValue = finalPGPart * fVolume - fAromaVolume;

        this.data.data.fBaseWithNicoVolume = Math.round(fBaseWithNicoVolume * 100) / 100;
        this.data.data.fBaseVolume = Math.round(fBaseVolume * 100) / 100;
        this.data.data.fPGValue = Math.round(fPGValue * 100) / 100;
        this.data.data.fAromaVolume = Math.round(fAromaVolume * 100 ) / 100;


        console.log({ fBaseWithNicoVolume, fBaseVolume, fPGValue, fAromaVolume });

    }
}

document.addEventListener('DOMContentLoaded', () => new Main());