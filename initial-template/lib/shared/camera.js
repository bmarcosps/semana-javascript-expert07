export default class Camera {
	constructor() {
		this.video = document.createElement('video');
	}

	static async init() {
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
		}
		const devices = await navigator.mediaDevices.enumerateDevices();
		const sourceToSelect = devices.find((v) => v.kind === 'videoinput' && v.label.includes('Webcam'));
		if (!sourceToSelect) throw new Error('No webcam found');

		const videoConfig = {
			audio: false,
			video: {
				deviceId: sourceToSelect.deviceId,
				width: globalThis.screen.availWidth,
				height: globalThis.screen.availHeight,
				frameRate: {
					ideal: 60,
				},
			},
		};

		const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
		const camera = new Camera();
		camera.video.srcObject = stream;

		// Debug reasons!
		camera.video.height = 240;
		camera.video.width = 320;
		document.body.append(camera.video);

		//aguarda a camera
		await new Promise((resolve) => {
			camera.video.onloadedmetadata = () => {
				resolve(camera.video);
			};
		});

		camera.video.play();

		return camera;
	}
}
