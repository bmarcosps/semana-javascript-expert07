import Camera from '../../../lib/shared/camera.js';
import { supportsWorkerType } from '../../../lib/shared/util.js';
import Controller from './controller.js';
import Service from './service.js';
import View from './view.js';
async function getWorker() {
	console.log('supportsWorkerType', supportsWorkerType());
	if (supportsWorkerType()) {
		const worker = new Worker('./src/worker.js', { type: 'module' });
		return worker;
	}
	console.warn('Web Workers are not supported in this browser');
	console.warn('Loading TensorFlow.js dependencies manually...');
	await import('https://unpkg.com/@tensorflow/tfjs-core@2.4.0/dist/tf-core.js');
	await import('https://unpkg.com/@tensorflow/tfjs-converter@2.4.0/dist/tf-converter.js');
	await import('https://unpkg.com/@tensorflow/tfjs-backend-webgl@2.4.0/dist/tf-backend-webgl.js');
	await import('https://unpkg.com/@tensorflow-models/face-landmarks-detection@0.0.1/dist/face-landmarks-detection.js');
	console.warn('Using a mock instead.');
	const service = new Service({
		faceLandmarksDetection: window.faceLandmarksDetection,
	});
	const workerMock = {
		async postMessage(video) {
			const blinked = await service.blinked(video);
			if (!blinked) return;
			workerMock.onmessage({ data: { blinked } });
		},
		// vai ser sobrescrito pelo controller
		onmessage() {},
	};
	console.log('loading tf model...');
	await service.loadModel();
	console.log('tf model loaded');
	setTimeout(() => workerMock.onmessage({ data: 'READY' }), 500);
	return workerMock;
}

const worker = await getWorker();

const camera = await Camera.init();
const cardListWorker = new Worker('./src/workers/cardListWorker.js', { type: 'module' });
const [rootPath] = window.location.href.split('/pages/');
const factory = {
	async initialize() {
		return Controller.initialize({
			view: new View(),
			camera,
			worker,
		});
	},
};

export default factory;
