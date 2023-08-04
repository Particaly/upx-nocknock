import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { build } from 'vite'
import { RollupWatcher } from "rollup";
import { copySync } from 'fs-extra'
import  * as chokidar from 'chokidar'

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const copyFiles = [
	{
		from: resolve(__dirname, '../utools'),
		to: resolve(__dirname, '../dist/utools')
	},
	{
		from: resolve(__dirname, '../logo.png'),
		to: resolve(__dirname, '../dist/logo.png')
	},
	{
		from: resolve(__dirname, '../plugin.json'),
		to: resolve(__dirname, '../dist/plugin.json')
	}
]

const watcher = chokidar.watch(resolve(__dirname, '../utools'))
watcher.add(resolve(__dirname, '../plugin.json'))
watcher.on('change', () => {
	copyFiles.forEach(item =>{
		copySync(item.from, item.to)
	})
	console.log(`copyed ${copyFiles.length} files.`);
})

async function main () {
	const watcher = await build({
		configFile: resolve(__dirname, '../vite.config.ts'),
	}) as RollupWatcher
	watcher.on('event', (event) => {
		if (event.code === 'BUNDLE_END') {
			console.log('BUNDLE_END');
			copyFiles.forEach(item =>{
				copySync(item.from, item.to)
			})
			console.log(`copyed ${copyFiles.length} files.`);
		}
	})
}

main()
