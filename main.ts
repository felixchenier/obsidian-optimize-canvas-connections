import { ItemView, App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

export default class OptimizeCanvasConnectionsPlugin extends Plugin {

	async onload() {
		this.addCommand({
			id: 'optimize-preserve-axes-selection',
			name: 'Optimize selection (preserve axes)',
			checkCallback: (checking: boolean) => {
				const canvasView = app.workspace.getActiveViewOfType(ItemView);
				if (canvasView?.getViewType() == "canvas") {
					if (!checking) {
						this.optimize('preserve-axes');
					}
					return true;
				}
			return false;
			}
		});
		this.addCommand({
			id: 'optimize-shortest-path-selection',
			name: 'Optimize selection (shortest path)',
			checkCallback: (checking: boolean) => {
				const canvasView = app.workspace.getActiveViewOfType(ItemView);
				if (canvasView?.getViewType() == "canvas") {
					if (!checking) {
						this.optimize('shortest-path');
					}
					return true;
				}
			return false;
			}
		});
	}

	onunload() {

	}
	
	async optimize(option: string) {
		const canvasView = app.workspace.getActiveViewOfType(ItemView);
		
		// @ts-ignore
		const canvas = canvasView?.canvas;
		
		// Read current selection
		const currentSelection = canvas?.selection;
		let selectedIDs = new Array();
		// @ts-ignore
		currentSelection.forEach(function(selection) {
			selectedIDs.push(selection.id);
		})
		let applyToAll = false;
		if (selectedIDs.length == 0) {
			applyToAll = true;
		}
		
		// Go through every edge
		for (let [edgeKey, edge] of canvas['edges']) {
		
			// Find from and to nodes
			let fromNode = edge['from']['node'];
			let toNode = edge['to']['node'];
			
			// Calculate the many possibilities of distance

			let fromPossibilities = [edge['from']['side']];  // default = no change

			if (applyToAll || selectedIDs.includes(fromNode['id'])){
				switch(option) {
					case "shortest-path":
						fromPossibilities = ['top', 'bottom', 'left', 'right'];
						break
					case "preserve-axes":
						switch(edge['from']['side']) {
							case 'top':
							case 'bottom':
								fromPossibilities = ['top', 'bottom'];
								break;
							case 'left':
							case 'right':
								fromPossibilities = ['left', 'right'];
								break;
						}
				}
			}

			let toPossibilities = [edge['to']['side']];  // default = no change
			
			if (applyToAll || selectedIDs.includes(toNode['id'])){
				switch(option) {
					case "shortest-path":
						toPossibilities = ['top', 'bottom', 'left', 'right'];
						break
					case "preserve-axes":
						switch(edge['to']['side']) {
							case 'top':
							case 'bottom':
								toPossibilities = ['top', 'bottom'];
								break;
							case 'left':
							case 'right':
								toPossibilities = ['left', 'right'];
								break;
						}
				}
			}
			
			let distances = []
			
			for (const fromSide of fromPossibilities) {

				let fromPoint = {'x': 0, 'y': 0};
				if (fromSide == 'top') {
					fromPoint = {'x': fromNode['x'] + fromNode['width']/2, 'y': fromNode['y']};
				} else if (fromSide == 'bottom') {
					fromPoint = {'x': fromNode['x'] + fromNode['width']/2, 'y': fromNode['y'] + fromNode['height']};
				} else if (fromSide == 'left') {
					fromPoint = {'x': fromNode['x'], 'y': fromNode['y'] + fromNode['height']/2};
				} else if (fromSide == 'right') {
					fromPoint = {'x': fromNode['x'] + fromNode['width'], 'y': fromNode['y'] + fromNode['height']/2};
				}
				
				for (const toSide of toPossibilities) {

					let toPoint = {'x': 0, 'y': 0};
					if (toSide == 'top') {
						toPoint = {'x': toNode['x'] + toNode['width']/2, 'y': toNode['y']};
					} else if (toSide == 'bottom') {
						toPoint = {'x': toNode['x'] + toNode['width']/2, 'y': toNode['y'] + toNode['height']};
					} else if (toSide == 'left') {
						toPoint = {'x': toNode['x'], 'y': toNode['y'] + toNode['height']/2};
					} else if (toSide == 'right') {
						toPoint = {'x': toNode['x'] + toNode['width'], 'y': toNode['y'] + toNode['height']/2};
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


