import Camera from '../../../lib/shared/camera.js';
import { supportsWorkerType } from '../../../lib/shared/util.js';
import Controller from './controller.js';
import Service from './service.js';
import View from './view.js';
if (supportsWorkerType()) {
	console.log('Worker type supported');
} else {
	console.log('Worker type not supported');
}

const camera = await Camera.init();
const cardListWorker = new Worker('./src/workers/cardListWorker.js', { type: 'module' });
const [rootPath] = window.location.href.split('/pages/');
const factory = {
	async initalize() {
		return Controller.initialize({
			view: new View({}),
			service: new Service({}),
		});
	},
};

export default factory;
