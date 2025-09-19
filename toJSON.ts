import { db } from "./database"
import { tagToString } from "./tags"

// Some quick settings
const includeTagIdInTagName = true
const includeDisambiguationInTagName = true

const tags = db.query( "SELECT * FROM tags" ).all()
const nodes = tags.map( ( tag: any ) => {
	// Get tag color
	let hex = null
	if ( tag.color_namespace && tag.color_slug ) {
		const color: any = db.query( `SELECT * FROM tag_colors WHERE namespace = "${ tag.color_namespace }" AND slug = "${ tag.color_slug }" LIMIT 1` ).get()
		hex = color.primary
	}

	// Return tag
	return {
		id: tag.id,
		label: tagToString( tag, includeTagIdInTagName, includeDisambiguationInTagName ),
		color: hex,
		category: tag.is_category,

		neighbors: [] as any[] | undefined,
		links: [] as any[] | undefined
	}
})

const tagParents = db.query( "SELECT * FROM tag_parents" ).all()
const links = tagParents.map( ( relationship: any ) => {
	return {
		source: relationship.parent_id,
		target: relationship.child_id
	}
})

const data = JSON.stringify( { nodes, links }, null, 4 )
await Bun.write( Bun.file( "./data.json" ), data )