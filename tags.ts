import { db } from "./database"

export interface Tag {
	id: number
	name: string
	shorthand: string
	color_namespace: string | null
	color_slug: string | null
	is_category: boolean
	icon: string | null
	disambiguation_id: number | null
}

export interface TagRelationship {
	parent_id: number
	child_id: number
}

export function tagToString( tag: Tag, includeTagId: boolean, includeDisambiguation: boolean ) {
	let tagName = tag.name
	
	if ( includeTagId ) tagName = `[${ tag.id }] ${ tagName }`

	if ( tag.disambiguation_id && includeDisambiguation ) {
		const disambiguationTag = getTagById( tag.disambiguation_id )
		tagName += ` (${ disambiguationTag.name })`
	}


	return tagName
}

export function getTags(): Tag[] {
	const tags = db.query( `SELECT * FROM tags` ).all() as Tag[]
	return tags
}

export function getTagById( tagId: number ): Tag {
	const tag: Tag = db.query(
		`SELECT * FROM tags WHERE id = ${ tagId } LIMIT 1`
	).get() as Tag
	return tag
}

export function getChildrenByTagId( tagId: number ): Tag[] {
	const relationships: TagRelationship[] = db.query(
		`SELECT * FROM tag_parents WHERE parent_id = ${ tagId }`
	).all() as TagRelationship[]

	return relationships.map( relationship => {
		return getTagById( relationship.child_id )
	})
}
export function getParentsByTagId( tagId: number ): Tag[] {
	const relationships: TagRelationship[] = db.query(
		`SELECT * FROM tag_parents WHERE child_id = ${ tagId }`
	).all() as TagRelationship[]

	return relationships.map( relationship => {
		return getTagById( relationship.parent_id )
	})
}

export function getRootTags(): Tag[] {
	const rootTags: Tag[] = db.query(`
		SELECT * FROM tags tag
		WHERE NOT EXISTS (
			SELECT 1 FROM tag_parents tag_parent
			WHERE tag_parent.child_id = tag.id
		)
	`).all() as Tag[]
	return rootTags
}

export function getTagAliases( tagId: number ) {
	const aliases = db.query(`
		SELECT name FROM tag_aliases WHERE tag_id = ${ tagId }
	`).all() as { name: string }[]

	return aliases.map( alias => alias.name )
}