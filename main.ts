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
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Shorten links', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.CleanCanvas();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'shorten-links-in-canvas',
			name: 'Shorten links in canvas',
			callback: () => {
				this.CleanCanvas();
			}
		});
		
		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}
	
	async CleanCanvas() {
		const canvasView = app.workspace.getActiveViewOfType(ItemView);
		if (canvasView?.getViewType() !== "canvas") {
			return
		}
		
		const activeFile = this.app.workspace.getActiveFile();

		if(!activeFile) {
			new Notice("No canvas detected!")
			return
		}
		
		const content = await this.app.vault.cachedRead(activeFile);
		const canvasData: CanvasData = JSON.parse(content);
		
		// Go through every edge
		for (let iEdge = 0; iEdge < canvasData['edges'].length; iEdge++) {
		
			// Find from and to nodes
			let fromNodeID = canvasData['edges'][iEdge]['fromNode'];
			let toNodeID = canvasData['edges'][iEdge]['toNode'];
			
			let fromNode = canvasData['nodes'].filter(obj => {
				return obj.id === fromNodeID
			})[0];
			let toNode = canvasData['nodes'].filter(obj => {
				return obj.id === toNodeID
			})[0];
			
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
			switch(distances[0]['fromSide']) {
				case 'top':
					canvasData['edges'][iEdge]['fromSide'] = 'top';
					break;
				case 'bottom':
					canvasData['edges'][iEdge]['fromSide'] = 'bottom';
					break;
				case 'left':
					canvasData['edges'][iEdge]['fromSide'] = 'left';
					break;
				case 'right':
					canvasData['edges'][iEdge]['fromSide'] = 'right';
					break;
			}					

			switch(distances[0]['toSide']) {
				case 'top':
					canvasData['edges'][iEdge]['toSide'] = 'top';
					break;
				case 'bottom':
					canvasData['edges'][iEdge]['toSide'] = 'bottom';
					break;
				case 'left':
					canvasData['edges'][iEdge]['toSide'] = 'left';
					break;
				case 'right':
					canvasData['edges'][iEdge]['toSide'] = 'right';
					break;
			}					
			
			// Save it
			this.app.vault.modify(activeFile, JSON.stringify(canvasData));
			
			
		}

	}



	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}




//------------------------------------
// THIS IS A COPY-PASTE FROM canvas.d.ts BECAUSE I DON'T KNOW HOW TO IMPORT IT YET

// A color used to encode color data for nodes and edges
// can be a number (like "1") representing one of the (currently 6) supported colors.
// or can be a custom color using the hex format "#FFFFFFF".
export type CanvasColor = string;

// The overall canvas file's JSON
export interface CanvasData {
    nodes: AllCanvasNodeData[];
    edges: CanvasEdgeData[];
}

// A node
export interface CanvasNodeData {
    // The unique ID for this node
    id: string;
    // The positional data
    x: number;
    y: number;
    width: number;
    height: number;
    // The color of this node
    color?: CanvasColor;
}

export type AllCanvasNodeData = CanvasFileData | CanvasTextData | CanvasLinkData | CanvasGroupData;

// A node that is a file, where the file is located somewhere in the vault.
export interface CanvasFileData extends CanvasNodeData {
    type: 'file';
    file: string;
    // An optional subpath which links to a heading or a block. Always starts with a `#`.
    subpath?: string;
}

// A node that is plaintext.
export interface CanvasTextData extends CanvasNodeData {
    type: 'text';
    text: string;
}

// A node that is an external resource.
export interface CanvasLinkData extends CanvasNodeData {
    type: 'link';
    url: string;
}

// A node that represents a group.
export interface CanvasGroupData extends CanvasNodeData {
    type: 'group';
    label?: string;
}

// The side of the node that a connection is connected to
export type NodeSide = 'top' | 'right' | 'bottom' | 'left';

// An edge
export interface CanvasEdgeData {
    // The unique ID for this edge
    id: string;
    // The node ID and side where this edge starts
    fromNode: string;
    fromSide: NodeSide;
    // The node ID and side where this edge ends
    toNode: string;
    toSide: NodeSide;
    // The color of this edge
    color?: CanvasColor;
    // The text label of this edge, if available
    label?: string;
}
