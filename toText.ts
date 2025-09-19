import { getParentsByTagId, getTagAliases, getTagById, getTags, tagToString } from "./tags"
import type { Tag } from "./tags"

// Some quick settings
const includeTagIdInTagName = true
const includeDisambiguationInTagName = true
const includeDisambiguationSection = true
const includeAliasesSection = true
const includeParentsSection = true

let tagList = ""

await Bun.write( Bun.file( "./tags.md" ), createTagList() )

function createTagList(): string {
	const tags = getTags()
	for ( const tag of tags ) {
		tagList += `${ listTag( tag ) }\n\n`
	}

	return tagList.trim()
}

function listTag( tag: Tag ): string {
	const tagParents = getParentsByTagId( tag.id )
	const tagAliases = getTagAliases( tag.id )

	let tagStr = `# ${ tagToString( tag, includeTagIdInTagName, includeDisambiguationInTagName ) }`

	if ( tag.disambiguation_id && includeDisambiguationSection ) {
		const disambiguationTag = getTagById( tag.disambiguation_id )
		tagStr += `\n\nDisambiguation: ${ tagToString( disambiguationTag, includeTagIdInTagName, includeDisambiguationInTagName ) }`
	}

	if ( tagAliases.length > 0 && includeAliasesSection ) {
		tagStr += `\n\nAliases:`
		for ( const tagAlias of tagAliases ) {
			tagStr += `\n- ${ tagAlias }`
		}
	}
	
	if ( tagParents.length > 0 && includeParentsSection ) {
		tagStr += `\n\nParents:`
		for ( const tagParent of tagParents ) {
			tagStr += `\n- ${ tagToString( tagParent, includeTagIdInTagName, includeDisambiguationInTagName ) }`
		}
	}

	return tagStr
}