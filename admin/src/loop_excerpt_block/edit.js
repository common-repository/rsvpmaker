/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import apiFetch from '@wordpress/api-fetch';
const { Component, Fragment } = wp.element;
const { Panel, PanelBody, ToggleControl } = wp.components;
import React, { useState, useEffect } from 'react';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit(props) {
	const { attributes: { show_rsvp_button, hide_excerpt, hide_date, hide_type }, setAttributes, context, isSelected } = props;
    const {postId} = context;
    const [excerptobj, setExcerptobj] = useState({});
    console.log(props);

    useEffect(() => {
        apiFetch( {path: '/rsvpmaker/v1/excerpt/'+postId+'?show_button=='+show_rsvp_button} ).then( ( excerpt ) => {
            setExcerptobj(excerpt);
        } );
    }, []);

    class ExcerptInspector extends Component {
	
            render() {
                const { attributes: { show_rsvp_button, hide_excerpt, hide_date, hide_type }, setAttributes, isSelected } = this.props;
                if (typeof hide_type == 'undefined')
                    hide_type = false;
                
                return (
                        <div>
                    <InspectorControls key="excerptinspector">
                    <PanelBody title={ __( 'RSVPMaker Excerpt', 'rsvpmaker' ) } >
                    <p>Optionally, the excerpt can display the date and RSVP registration button. Use the separate RSVPMaker Date Block and RSVPMaker Button blocks for more formatting control of those elements.</p>
                    <h3>Elements shown by default</h3>
                    <ToggleControl
                label={__("Hide Event Date/Time",'rsvpmaker')}
                checked={ hide_date }
                onChange={ ( hide_date ) => { setAttributes( { hide_date } ) } }
            />
            <ToggleControl
                label={__("Hide Event Type",'rsvpmaker')}
                checked={ hide_type }
                onChange={ ( hide_type ) => { setAttributes( { hide_type } ) } }
            />
                    <ToggleControl
                label={__("Hide Excerpt",'rsvpmaker')}
                checked={ hide_excerpt }
                onChange={ ( hide_excerpt ) => { setAttributes( { hide_excerpt } ) } }
            />
            <h3>Optional Elements</h3>
                    <ToggleControl
                label={__("Show RSVP Button",'rsvpmaker')}
                checked={ show_rsvp_button }
                onChange={ ( show_rsvp_button ) => { setAttributes( { show_rsvp_button } ) } }
            />
            </PanelBody>
            </InspectorControls>
            </div>
        );	} }
    return (
				<Fragment>
                <div { ...useBlockProps() }>
                        <ExcerptInspector {...props}/>
                        {excerptobj.dateblock && (
                        <>
                        {!hide_date && <div dangerouslySetInnerHTML={{__html: excerptobj.dateblock}} />}
                        {!hide_excerpt && <p>{excerptobj.excerpt}</p>}
                        {show_rsvp_button && excerptobj.rsvp_on && <div dangerouslySetInnerHTML={{__html: excerptobj.rsvp_on}} />}
                        {!hide_type && excerptobj.types && <p className="rsvpmeta" dangerouslySetInnerHTML={{__html: excerptobj.types}} />}
                        </>
                        )}
                        {!excerptobj.dateblock && (
                        <>
                        <p>Loading ...</p>
                        </>
                        )}
                   </div>
                 </Fragment>
    );
}
