export default class Controller {
	#view;
	#camera;
	#worker;
	#blinkCount = 0;
	constructor({ view, camera, worker }) {
		this.#view = view;
		this.#camera = camera;
		this.#worker = this.#configureWorker(worker);

		this.#view.configureOnBtnClick(this.onBtnStart.bind(this));
	}

	static async initialize(deps) {
		const controller = new Controller(deps);
		controller.log('Not yet initialized. Click the button to start');
		return controller.init();
	}

	#configureWorker(worker) {
		let ready = false;
		console.log('configuring worker', worker);
		worker.onmessage = ({ data }) => {
			console.log('controller received message', data);
			if (data === 'READY') {
				this.#view.enableButton();
				ready = true;
				return;
			}
			const blinked = data.blinked;
			this.#blinkCount += blinked;
			this.#view.togglePlayVideo();
			console.log('blinked', blinked);
		};
		return {
			send(msg) {
				if (!ready) return;
				worker.postMessage(msg);
			},
		};
	}

	async init() {
		console.log('init');
	}

	loop() {
		const video = this.#camera.video;
		const img = this.#view.getVideoFrame(video);
		this.#worker.send(img);
		this.log('detecting faces...');

		setTimeout(() => this.loop(), 100);
	}

	log(txt) {
		const times = `    - blinked times: ${this.#blinkCount}`;
		this.#view.log(`logger: ${txt}`.concat(this.#blinkCount ? times : ''));
	}

	onBtnStart() {
		this.log('Starting...');
		this.#blinkCount = 0;
		this.loop();
	}
}
