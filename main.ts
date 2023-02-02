import { ItemView, App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'shorten-links-in-canvas',
			name: 'Shorten links in canvas',
			callback: () => {
				this.CleanCanvas();
			}
		});
		
	}

	onunload() {

	}
	
	async CleanCanvas() {
		const canvasView = app.workspace.getActiveViewOfType(ItemView);
		if (canvasView?.getViewType() !== "canvas") {
			new Notice("The current view must be a canvas");
			return
		}
		
		// @ts-ignore
		const canvas = canvasView?.canvas;
		
		// Go through every edge
		for (let [edgeKey, edge] of canvas['edges']) {
		
			// Find from and to nodes
			let fromNode = edge['from']['node'];
			let toNode = edge['to']['node'];
			
			// Calculate the 16 possibilities of distance
			let distances = []
			
			for (const fromSide of ['top', 'bottom', 'left', 'right']) {

				let fromPoint = {'x': 0, 'y': 0};
				if (fromSide == 'top') {
					fromPoint = {'x': fromNode['x'], 'y': fromNode['y'] - fromNode['height']/2};
				} else if (fromSide == 'bottom') {
					fromPoint = {'x': fromNode['x'], 'y': fromNode['y'] + fromNode['height']/2};
				} else if (fromSide == 'left') {
					fromPoint = {'x': fromNode['x'] - fromNode['width']/2, 'y': fromNode['y']};
				} else if (fromSide == 'right') {
					fromPoint = {'x': fromNode['x'] + fromNode['width']/2, 'y': fromNode['y']};
				}
				
				for (const toSide of ['top', 'bottom', 'left', 'right']) {

					let toPoint = {'x': 0, 'y': 0};
					if (toSide == 'top') {
						toPoint = {'x': toNode['x'], 'y': toNode['y'] - toNode['height']/2};
					} else if (toSide == 'bottom') {
						toPoint = {'x': toNode['x'], 'y': toNode['y'] + toNode['height']/2};
					} else if (toSide == 'left') {
						toPoint = {'x': toNode['x'] - toNode['width']/2, 'y': toNode['y']};
					} else if (toSide == 'right') {
						toPoint = {'x': toNode['x'] + toNode['width']/2, 'y': toNode['y']};
					}

					distances.push({
						'fromSide': fromSide,
						'toSide': toSide,
						'distance': (toPoint.x - fromPoint.x) ** 2 + (toPoint.y - fromPoint.y) ** 2});
					
				}
			}
			
			// Find the best one			
			distances = distances.sort(function(a, b) {
			    return a.distance - b.distance;
			});
			
			// Assign it
			edge['from']['side'] = distances[0]['fromSide'];
			edge['to']['side'] = distances[0]['toSide'];
			edge.render();
			
		}
		
	canvas.requestSave();		

	}


}


