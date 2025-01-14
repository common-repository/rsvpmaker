/* BLOCK: rsvpmaker-block
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */
//  Import CSS.
import './style.scss';
import './editor.scss';
import './rsvpemail-sidebar.js';		
import './limited_time.js';		
import './schedule.js';
import './form.js';		
import './rsvpmailer-wrapper.js';
import apiFetch from '@wordpress/api-fetch';
import {useState, useEffect} from "@wordpress/element";

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks
const { PanelBody, SelectControl, TextControl, ToggleControl, ColorPicker, FontSizePicker } = wp.components;
const { Component, Fragment, RawHTML } = wp.element;
const { InspectorControls, useBlockProps } = wp.blockEditor;

const rsvpupcoming = [{label: __('Choose event'),value: ''},{label: __('Next event'),value: 'next'},{label: __('Next event - RSVP on'),value: 'nextrsvp'}];
apiFetch( {path: 'rsvpmaker/v1/future'} ).then( events => {
	if(Array.isArray(events)) {
		 events.map( function(event) { if(event.ID) { var title = (event.date) ? event.post_title+' - '+event.date : event.post_title; rsvpupcoming.push({value: event.ID, label: title }) } } );
	}
	 else {
		 var eventsarray = Object.values(events);
		 eventsarray.map( function(event) { if(event.ID) { var title = (event.date) ? event.post_title+' - '+event.date : event.post_title; rsvpupcoming.push({value: event.ID, label: title }) } } );
		}
}).catch(err => {
	console.log(err);
});

const rsvptypes = [{value: '', label: 'None selected (optional)'}];
apiFetch( {path: 'rsvpmaker/v1/types'} ).then( types => {
	if(Array.isArray(types))
			types.map( function(type) { if(type.slug && type.name) rsvptypes.push({value: type.slug, label: type.name }) } );
		else {
			var typesarray = Object.values(types);
			typesarray.map( function(type) { if(type.slug && type.name) rsvptypes.push({value: type.slug, label: type.name }) } );
		}
}).catch(err => {
	console.log(err);
});	

const rsvpauthors = [{value: '', label: 'Any'}];
apiFetch( {path: 'rsvpmaker/v1/authors'} ).then( authors => {
	if(Array.isArray(authors))
			authors.map( function(author) { if(author.ID && author.name) rsvpauthors.push({value: author.ID, label: author.name }) } );
		else {
			authors = Object.values(authors);
			authors.map( function(author) { if(author.ID && author.name) rsvpauthors.push({value: author.ID, label: author.name }) } );
		}
}).catch(err => {
	console.log(err);
});	

/**
 * Register: a Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */

registerBlockType( 'rsvpmaker/event', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'RSVPMaker Embed Event' ), // Block title.
	icon: 'clock', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'rsvpmaker', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	description: __('Displays a single RSVPMaker event post'),
	keywords: [
		__( 'RSVPMaker' ),
		__( 'Event' ),
		__( 'Calendar' ),
	],
       attributes: {
            post_id: {
            type: 'string',
            default: '',
            },
            one_hideauthor: {
                type: 'boolean',
                default: true,
            },
            type: {
                type: 'string',
                default: '',
            },
            one_format: {
                type: 'string',
				default: '',
            },
            hide_past: {
                type: 'string',
                default: '',
            },
        },
	edit: function( props ) {
	const { attributes: { post_id, type, one_hideauthor, one_format, hide_past }, setAttributes, isSelected } = props;
	if(post_id == '')
		setAttributes( { post_id: 'next' } );

	function showFormPrompt () {
		return <p><strong>Click here to set options.</strong></p>
	}

	function showForm() {

			return (
				<form>
<SelectControl
        label={__("Select Post",'rsvpmaker')}
        value={ post_id }
        options={ rsvpupcoming }
        onChange={ ( post_id ) => { setAttributes( { post_id: post_id } ) } }
    />
<SelectControl
        label={__("Format",'rsvpmaker')}
        value={ one_format }
        options={ [
	{label: 'Event with Form', value:''},
	{label: 'Event with Button', value:'button'},
	{label: 'Button Only', value:'button_only'},
	{label: 'Form Only', value:'form'},
	{label: 'Compact (Headline/Date/Button)', value:'compact'},
	{label: 'Dates Only', value:'embed_dateblock'}] }
        onChange={ ( one_format ) => { setAttributes( { one_format: one_format } ) } }
/>

<SelectControl
        label={__("Hide After",'rsvpmaker')}
        value={ hide_past }
        options={ [
	{label: 'Not Set', value:''},
	{label: '1 hour', value:'1'},
	{label: '2 hours', value:'2'},
	{label: '3 hours', value:'3'},
	{label: '4 hours', value:'4'},
	{label: '5 hours', value:'5'},
	{label: '6 hours', value:'6'},
	{label: '7 hours', value:'7'},
	{label: '8 hours', value:'8'},
	{label: '12 hours', value:'12'},
	{label: '18 hours', value:'18'},
	{label: '24 hours', value:'24'},
	{label: '2 days', value:'48'},
	{label: '3 days', value:'72'}] }
        onChange={ ( hide_past ) => { setAttributes( { hide_past: hide_past } ) } }
/>

<SelectControl
        label={__("Event Type",'rsvpmaker')}
        value={ type }
        options={ rsvptypes }
        onChange={ ( type ) => { setAttributes( { type: type } ) } }
    />

<SelectControl
        label={__("Show Author",'rsvpmaker')}
        value={ one_hideauthor }
        options={ [{label: 'No', value:'1'},{label: 'Yes', value:'0'}] }
        onChange={ ( one_hideauthor ) => { setAttributes( { one_hideauthor: one_hideauthor } ) } }
    />
				</form>
			);
		}

		return (
			<div className={ props.className }>
				<p class="dashicons-before dashicons-clock"><strong>RSVPMaker</strong>: Embed a single event.
				</p>
			{ isSelected && ( showForm() ) }
			{ !isSelected && ( showFormPrompt() ) }
			</div>
		);
	},

	save: function() {
		// server render
		return null;
	},
} );

registerBlockType( 'rsvpmaker/next-events', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'RSVPMaker Next Events' ), // Block title.
	icon: 'clock', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'rsvpmaker', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	description: __('Invites registration for next event, or next few dates'),
	keywords: [
		__( 'RSVPMaker' ),
		__( 'Event' ),
		__( 'Calendar' ),
	],
       attributes: {
            number_of_posts: {
            type: 'int',
            default: '5',
            },
        },
	edit: function( props ) {
	const { attributes: { number_of_posts }, setAttributes, isSelected } = props;
	const [preview, setPreview] = useState([]);

	const fetchPreview = async () => {
		const path = '/rsvpmaker/v1/preview/next-events?number_of_posts='+number_of_posts;
		console.log(path);
		const preview = await apiFetch({path});
		setPreview(preview);
	}

	useEffect( () => { fetchPreview(); }, [number_of_posts]);
/*	if ( preview.length === 0 ) {
		return <div {...useBlockProps()}>Loading</div>;
	}
*/
		return (
			<div className={ props.className }>
				<p class="dashicons-before dashicons-clock"><strong>RSVPMaker</strong>: Registration invite for one or more events.
				</p>
	<SelectControl
	label={__("Number of Event Links Shown",'rsvpmaker')}
	value={ number_of_posts }
	options={ [
	{label: '1 (next only)', value:1},
	{label: '2 (next +1)', value:2},
	{label: '3 (next +2)', value:3},
	{label: '4 (next +3)', value:4},
	{label: '5 (next +4)', value:5},
	{label: '6 (next +5)', value:6},
	{label: '7 (next +6)', value:7},
	{label: '8 (next +7)', value:8},
	{label: '9 (next +8)', value:9},
	{label: '10 (next +9)', value:10}] }
        onChange={ ( number_of_posts ) => { setAttributes( { number_of_posts } ) } }
/>
<RawHTML>{preview}</RawHTML>
			</div>
		);
	},

	save: function() {
		// server render
		return null;
	},
} );

registerBlockType( 'rsvpmaker/embedform', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'RSVPMaker Embed Event Form' ), // Block title.
	icon: 'clock', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'rsvpmaker', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	description: __('Displays the form associated with a single RSVPMaker event post'),
	keywords: [
		__( 'RSVPMaker' ),
		__( 'Event' ),
		__( 'Calendar' ),
	],
       attributes: {
            post_id: {
            type: 'string',
            default: '',
            },
        },
	edit: function( props ) {
	const { attributes: { post_id, type, one_hideauthor, one_format, hide_past }, setAttributes, isSelected } = props;
	if(post_id == '')
		setAttributes( { post_id: 'next' } );

	function showFormPrompt () {
		return <p><strong>Click here to set options.</strong></p>
	}

	function showForm() {

			return (
				<form>
<SelectControl
        label={__("Select Post",'rsvpmaker')}
        value={ post_id }
        options={ rsvpupcoming }
        onChange={ ( post_id ) => { setAttributes( { post_id: post_id } ) } }
    />
	</form>
			);
		}

		return (
			<div className={ props.className }>
				<p class="dashicons-before dashicons-clock"><strong>RSVPMaker</strong>: Embed just the form for a single event.
				</p>
			{ isSelected && ( showForm() ) }
			{ !isSelected && ( showFormPrompt() ) }
			</div>
		);
	},

	save: function() {
		return null;
	},
} );

registerBlockType( 'rsvpmaker/submission', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'RSVPMaker Event Submission' ), // Block title.
	icon: 'clock', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'rsvpmaker', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	description: __('Displays a Form for Submitting an Event for Approvoal'),
	keywords: [
		__( 'RSVPMaker' ),
		__( 'Event' ),
		__( 'Submission' ),
	],
       attributes: {
            to: {
	
				type: 'string',
            default: '',
            },
            timezone: {
				type: 'boolean',
				default: false,
			},
		},
	edit: function( props ) {
	const { attributes: { to, timezone }, setAttributes, isSelected } = props;
	function showFormPrompt () {
		return <p><strong>Click here to set options.</strong></p>
	}

	function showForm() {

			return (
		<div>
	<ToggleControl
        label={__("Prompt for Timezone",'rsvpmaker')}
        checked={ timezone }
        onChange={ ( timezone ) => { setAttributes( { timezone } ) } }
    />
	<TextControl 
		label={__("Notification Emails: To override default from Settings, enter one or more emails, separated by commas",'rsvpmaker')}
		value={to}
		onChange={ ( to ) => { setAttributes( { to } ) } }
	/>
	</div>
			);
		}

		return (
			<div className={ props.className }>
				<p class="dashicons-before dashicons-clock"><strong>RSVPMaker</strong>: {__('Allow non-authenticated users to submit events for approval by an editor.')}
				</p>
			{ isSelected && ( showForm() ) }
			{ !isSelected && ( showFormPrompt() ) }
			</div>
		);
	},

	save: function() {
		return null;
	},
} );

registerBlockType( 'rsvpmaker/eventlisting', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'RSVPMaker Event Listing' ), // Block title.
	icon: 'calendar-alt', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'rsvpmaker', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	description: __('Displays an RSVPMaker event listing (headlines and dates)'),
	keywords: [
		__( 'RSVPMaker' ),
		__( 'Events' ),
		__( 'Calendar' ),
	],
       attributes: {
            days: {
                type: 'int',
				default: 180,
            },
            posts_per_page: {
                type: 'int',
				default: 10,
            },
            type: {
                type: 'string',
                default: '',
            },
            date_format: {
                type: 'string',
                default: '%A %B %e, %Y',
            },
            time: {
                type: 'int',
                default: 0,
            },
        },
	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	edit: function( props ) {
		// Creates a <p class='wp-block-cgb-block-toast-block'></p>.
	const { attributes: { days, posts_per_page, type, date_format, time }, setAttributes, isSelected } = props;

	function showFormPrompt () {
		return <p><strong>{__('Click here to set options.','rsvpmaker')}</strong></p>
	}
		
	function showForm() {
			return (
				<form  >
					<SelectControl
        label={__("Events Per Page",'rsvpmaker')}
        value={ posts_per_page }
        options={ [{value: 5, label: 5},
			{value: 10, label: 10},
			{value: 15, label: 15},
			{value: 20, label: 20},
			{value: 25, label: 25},
			{value: 30, label: 30},
			{value: 35, label: 35},
			{value: 40, label: 40},
			{value: 45, label: 45},
			{value: 50, label: 50},
			{value: '-1', label: 'No limit'}]}
        onChange={ ( posts_per_page ) => { setAttributes( { posts_per_page: posts_per_page } ) } }
    />
					<SelectControl
        label={__("Date Range",'rsvpmaker')}
        value={ days }
        options={ [{value: 5, label: 5},
			{value: 30, label: '30 Days'},
			{value: 60, label: '60 Days'},
			{value: 90, label: '90 Days'},
			{value: 180, label: '180 Days'},
			{value: 366, label: '1 Year'}] }
        onChange={ ( days ) => { setAttributes( { days: days } ) } }
    />
					<SelectControl
        label={__("Event Type",'rsvpmaker')}
        value={ type }
        options={ rsvptypes }
        onChange={ ( type ) => { setAttributes( { type: type } ) } }
    />
				<SelectControl
        label={__("Date Format",'rsvpmaker')}
        value={ date_format }
        options={ [
            { label: 'Thursday August 8, 2019', value: '%A %B %e, %Y' },
            { label: 'August 8, 2019', value: '%B %e, %Y' },
            { label: 'August 8', value: '%B %e' },
            { label: 'Aug. 8', value: '%h. %e' },
            { label: '8 August 2019', value: '%e %B %Y' },
        ] }
        onChange={ ( date_format ) => { setAttributes( { date_format: date_format } ) } }
    />
				<ToggleControl
        label={__("Include Time",'rsvpmaker')}
        checked={ time }
        onChange={ ( time ) => { setAttributes( { time: time } ) } }
    />
				</form>
			);
		}

		return (
			<div className={ props.className }>
				<p  class="dashicons-before dashicons-calendar-alt"><strong>RSVPMaker</strong>: Add an Events Listing and/or Calendar Display
				</p>
			{ isSelected && ( showForm() ) }
			{ !isSelected && ( showFormPrompt() ) }
			</div>
		);
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	save: function( props ) {
		return null;
	},
} );


registerBlockType( 'rsvpmaker/stripecharge', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Stripe Charge (RSVPMaker)' ), // Block title.
	icon: 'products', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'rsvpmaker', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	description: __('Displays a payment widget for the Stripe service'),
	keywords: [
		__( 'RSVPMaker' ),
		__( 'Payment' ),
		__( 'Charge' ),
	],
       attributes: {
            description: {
            type: 'string',
            default: '',
            },
            showdescription: {
            type: 'string',
            default: 'no',
            },
            amount: {
            type: 'string',
            default: '',
            },
            paymentType: {
            type: 'string',
            default: 'once',
            },
            amount: {
            type: 'string',
            default: '',
            },
            currency: {
				type: 'string',
				default: 'usd',
			},
			january: {
            type: 'string',
            default: '',
            },
            february: {
            type: 'string',
            default: '',
            },
            march: {
            type: 'string',
            default: '',
            },
            april: {
            type: 'string',
            default: '',
            },
            may: {
            type: 'string',
            default: '',
            },
            june: {
            type: 'string',
            default: '',
            },
            july: {
            type: 'string',
            default: '',
            },
            august: {
            type: 'string',
            default: '',
            },
            september: {
            type: 'string',
            default: '',
            },
            october: {
            type: 'string',
            default: '',
            },
            november: {
            type: 'string',
            default: '',
            },
            december: {
            type: 'string',
            default: '',
            },
			paypal: {
				type: 'boolean',
				default: false,
			},
        },
	edit: function( props ) {
		// Creates a <p class='wp-block-cgb-block-toast-block'></p>.
	const { attributes: { description, showdescription, amount, paymentType, january, february, march, april, may, june, july, august, september, october, november, december, paypal, currency }, setAttributes, isSelected } = props;
		var show = (paymentType.toString() == 'schedule') ? true : false;
		//alert(show);
		
		if(!isSelected)
			return (
			<div className={ props.className }>
				<p class="dashicons-before dashicons-products"><strong>Payment Button</strong>: Embed in any post or page (not meant to be included in events). Click to set price and options.
				</p>
				</div>
			);
		
		return (
			<div className={ props.className }>
				<p class="dashicons-before dashicons-products"><strong>Payment Button</strong>: Embed in any post or page (not meant to be included in events).
				</p>
	<TextControl
        label={ __( 'Description', 'rsvpmaker' ) }
        value={ description }
        onChange={ ( description ) => setAttributes( { description } ) }
    />	
<div>		<SelectControl
			label={ __( 'Show Amount/Description Under Button', 'rsvpmaker' ) }
			value={ showdescription }
			onChange={ ( showdescription ) => setAttributes( { showdescription } ) }
			options={ [
				{ value: 'yes', label: __( 'Yes', 'rsvpmaker' ) },
				{ value: 'no', label: __( 'No', 'rsvpmaker' ) },
			] }
		/>

		<SelectControl
			label={ __( 'Payment Type', 'rsvpmaker' ) }
			value={ paymentType }
			onChange={ ( paymentType ) => setAttributes( { paymentType } ) }
			options={ [
				{ value: 'one-time', label: __( 'One time, fixed fee', 'rsvpmaker' ) },
				{ value: 'schedule', label: __( 'Dues schedule', 'rsvpmaker' ) },
				{ value: 'donation', label: __( 'Donation', 'rsvpmaker' ) },
			] }
		/>
				</div>
{
!show &&	<TextControl
        label={ __( 'Fee', 'rsvpmaker' ) }
        value={ amount }
		placeholder="$0.00"
        onChange={ ( amount ) => setAttributes( { amount } ) }
    />			
}
			{
show &&	
<div>    <TextControl
        label={ __( 'January', 'rsvpmaker' ) }
        value={ january }
        onChange={ ( january ) => setAttributes( { january } ) }
    />
    <TextControl
        label={ __( 'February', 'rsvpmaker' ) }
        value={ february }
        onChange={ ( february ) => setAttributes( { february } ) }
    />
    <TextControl
        label={ __( 'March', 'rsvpmaker' ) }
        value={ march }
        onChange={ ( march ) => setAttributes( { march } ) }
    />
    <TextControl
        label={ __( 'April', 'rsvpmaker' ) }
        value={ april }
        onChange={ ( april ) => setAttributes( { april } ) }
    />
    <TextControl
        label={ __( 'May', 'rsvpmaker' ) }
        value={ may }
        onChange={ ( may ) => setAttributes( { may } ) }
    />
    <TextControl
        label={ __( 'June', 'rsvpmaker' ) }
        value={ june }
        onChange={ ( june ) => setAttributes( { june } ) }
    />
    <TextControl
        label={ __( 'July', 'rsvpmaker' ) }
        value={ july }
        onChange={ ( july ) => setAttributes( { july } ) }
    />
    <TextControl
        label={ __( 'August', 'rsvpmaker' ) }
        value={ august }
        onChange={ ( august ) => setAttributes( { august } ) }
    />
    <TextControl
        label={ __( 'September', 'rsvpmaker' ) }
        value={ september }
        onChange={ ( september ) => setAttributes( { september } ) }
    />
    <TextControl
        label={ __( 'October', 'rsvpmaker' ) }
        value={ october }
        onChange={ ( october ) => setAttributes( { october } ) }
    />
    <TextControl
        label={ __( 'November', 'rsvpmaker' ) }
        value={ november }
        onChange={ ( november ) => setAttributes( { november } ) }
    />
    <TextControl
        label={ __( 'December', 'rsvpmaker' ) }
        value={ december }
        onChange={ ( december ) => setAttributes( { december } ) }
    />
</div>
 }
 	<ToggleControl
        label={__("Show PayPal Also",'rsvpmaker')}
        checked={ paypal }
        onChange={ ( paypal ) => { setAttributes( { paypal } ) } }
    />
	<TextControl
        label={ __( 'Currency Code (lowercase)', 'rsvpmaker' ) }
        value={ currency }
        onChange={ ( currency ) => setAttributes( { currency } ) }
    />
			</div>
		);
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	save: function() {
		// server render
		return null;
	},
} );

registerBlockType( 'rsvpmaker/paypal', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'PayPal Charge (RSVPMaker)' ), // Block title.
	icon: 'products', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'rsvpmaker', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	description: __('Displays a payment widget for the PayPal service'),
	keywords: [
		__( 'RSVPMaker' ),
		__( 'Payment' ),
		__( 'PayPal' ),
	],
       attributes: {
            description: {
            type: 'string',
            default: '',
            },
            showdescription: {
            type: 'string',
            default: 'no',
            },
            amount: {
            type: 'string',
            default: '',
            },
            paymentType: {
            type: 'string',
            default: 'once',
            },
            currencyCode: {
				type: 'string',
				default: 'USD',
			},
			amount: {
            type: 'string',
            default: '',
            },
            january: {
            type: 'string',
            default: '',
            },
            february: {
            type: 'string',
            default: '',
            },
            march: {
            type: 'string',
            default: '',
            },
            april: {
            type: 'string',
            default: '',
            },
            may: {
            type: 'string',
            default: '',
            },
            june: {
            type: 'string',
            default: '',
            },
            july: {
            type: 'string',
            default: '',
            },
            august: {
            type: 'string',
            default: '',
            },
            september: {
            type: 'string',
            default: '',
            },
            october: {
            type: 'string',
            default: '',
            },
            november: {
            type: 'string',
            default: '',
            },
            december: {
            type: 'string',
            default: '',
            },
        },
	edit: function( props ) {
		// Creates a <p class='wp-block-cgb-block-toast-block'></p>.
	const { attributes: { description, showdescription, amount, paymentType, january, february, march, april, may, june, july, august, september, october, november, december, currencyCode }, setAttributes, isSelected } = props;
		var show = (paymentType.toString() == 'schedule') ? true : false;
		//alert(show);
		
		if(!isSelected)
			return (
			<div className={ props.className }>
				<p class="dashicons-before dashicons-products"><strong>PayPal Payment Button</strong>: Embed in any post or page (not meant to be included in events). Click to set price and options.
				</p>
				</div>
			);
		
		return (
			<div className={ props.className }>
				<p class="dashicons-before dashicons-products"><strong>PayPal Payment Button</strong>: Embed in any post or page (not meant to be included in events).
				</p>
	<TextControl
        label={ __( 'Description', 'rsvpmaker' ) }
        value={ description }
        onChange={ ( description ) => setAttributes( { description } ) }
    />	
<div>		<SelectControl
			label={ __( 'Show Amount/Description Under Button', 'rsvpmaker' ) }
			value={ showdescription }
			onChange={ ( showdescription ) => setAttributes( { showdescription } ) }
			options={ [
				{ value: 'yes', label: __( 'Yes', 'rsvpmaker' ) },
				{ value: 'no', label: __( 'No', 'rsvpmaker' ) },
			] }
		/>

		<SelectControl
			label={ __( 'Payment Type', 'rsvpmaker' ) }
			value={ paymentType }
			onChange={ ( paymentType ) => setAttributes( { paymentType } ) }
			options={ [
				{ value: 'one-time', label: __( 'One time, fixed fee', 'rsvpmaker' ) },
				{ value: 'schedule', label: __( 'Dues schedule', 'rsvpmaker' ) },
				{ value: 'donation', label: __( 'Donation', 'rsvpmaker' ) },
			] }
		/>
				</div>
{
!show &&	<TextControl
        label={ __( 'Fee', 'rsvpmaker' ) }
        value={ amount }
		placeholder="$0.00"
        onChange={ ( amount ) => setAttributes( { amount } ) }
    />			
}
			{
show &&	
<div>    <TextControl
        label={ __( 'January', 'rsvpmaker' ) }
        value={ january }
        onChange={ ( january ) => setAttributes( { january } ) }
    />
    <TextControl
        label={ __( 'February', 'rsvpmaker' ) }
        value={ february }
        onChange={ ( february ) => setAttributes( { february } ) }
    />
    <TextControl
        label={ __( 'March', 'rsvpmaker' ) }
        value={ march }
        onChange={ ( march ) => setAttributes( { march } ) }
    />
    <TextControl
        label={ __( 'April', 'rsvpmaker' ) }
        value={ april }
        onChange={ ( april ) => setAttributes( { april } ) }
    />
    <TextControl
        label={ __( 'May', 'rsvpmaker' ) }
        value={ may }
        onChange={ ( may ) => setAttributes( { may } ) }
    />
    <TextControl
        label={ __( 'June', 'rsvpmaker' ) }
        value={ june }
        onChange={ ( june ) => setAttributes( { june } ) }
    />
    <TextControl
        label={ __( 'July', 'rsvpmaker' ) }
        value={ july }
        onChange={ ( july ) => setAttributes( { july } ) }
    />
    <TextControl
        label={ __( 'August', 'rsvpmaker' ) }
        value={ august }
        onChange={ ( august ) => setAttributes( { august } ) }
    />
    <TextControl
        label={ __( 'September', 'rsvpmaker' ) }
        value={ september }
        onChange={ ( september ) => setAttributes( { september } ) }
    />
    <TextControl
        label={ __( 'October', 'rsvpmaker' ) }
        value={ october }
        onChange={ ( october ) => setAttributes( { october } ) }
    />
    <TextControl
        label={ __( 'November', 'rsvpmaker' ) }
        value={ november }
        onChange={ ( november ) => setAttributes( { november } ) }
    />
    <TextControl
        label={ __( 'December', 'rsvpmaker' ) }
        value={ december }
        onChange={ ( december ) => setAttributes( { december } ) }
    />
</div>
 }
<TextControl
        label={ __( 'Currency Code', 'rsvpmaker' ) }
        value={ currencyCode }
        onChange={ ( currencyCode ) => setAttributes( { currencyCode } ) }
    />
			</div>
		);
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	save: function() {
		// server render
		return null;
	},
} );

registerBlockType( 'rsvpmaker/placeholder', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Placeholder' ), // Block title.
	icon: 'products', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'formatting', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	description: __('Placeholder for content to be added later'),
	keywords: [
		__( 'RSVPMaker' ),
		__( 'Placeholder' ),
		__( 'Layout' ),
	],
       attributes: {
            text: {
            type: 'string',
            default: '',
            },
        },
	edit: function( props ) {
		const { attributes: { text }, setAttributes, isSelected } = props;
			
		if(isSelected)
		return (
			<div className={ props.className }>
	<TextControl
        label={ __( 'Text', 'rsvpmaker' ) }
        value={ text }
        onChange={ ( text ) => setAttributes( { text } ) }
    />	
	<p class="dashicons-before dashicons-welcome-write-blog"><em>(Not shown on front end. Delete from finished post)</em></p>
				</div>
			);
		
		return (
			<div className={ props.className }>
				<p class="dashicons-before dashicons-welcome-write-blog">{text} <em>(Placeholder: Not shown on front end)</em></p>
				</div>
			);
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	save: function() {
		// server render
		return null;
	},
} );

registerBlockType( 'rsvpmaker/upcoming-by-json', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'RSVPMaker Events (fetch via API)' ), // Block title.
	icon: 'calendar-alt', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'rsvpmaker', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	description: __('Displays a listing of RSVPMaker events from a remote site'),
	keywords: [
		__( 'RSVPMaker' ),
		__( 'Events' ),
		__( 'Calendar' ),
	],
       attributes: {
            limit: {
                type: 'int',
				default: 10,
            },
            url: {
                type: 'string',
                default: '',
            },
            morelink: {
                type: 'string',
                default: '',
            },
        },
	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	edit: function( props ) {
	const { attributes: { limit, url, morelink }, setAttributes, isSelected } = props;
	let typelist = '';
	if(rsvpupcoming && (rsvpupcoming.length > 2))
	{
		typelist = 'API urls for  this site:\n'+window.location.protocol+'//'+window.location.hostname+'/wp-json/rsvpmaker/v1/future\n';
		rsvptypes.forEach(showTypes);	
	}

function showTypes (data, index) {
	if(index > 0)
		typelist = typelist.concat(rsvpmaker.json_url+'type/'+data.value + '\n'); 
}

function showForm() {
return (<div>
	<TextControl
        label={ __( 'JSON API url', 'rsvpmaker' ) }
        value={ url }
        onChange={ ( url ) => setAttributes( { url } ) }
    />
	<TextControl
        label={ __( 'Limit', 'rsvpmaker' ) }
        value={ limit }
		help={__('For no limit, enter 0')}
        onChange={ ( limit ) => setAttributes( { limit } ) }
    />	
	<TextControl
        label={ __( 'Link URL for more results (optional)', 'rsvpmaker' ) }
        value={ morelink }
        onChange={ ( morelink ) => setAttributes( { morelink } ) }
    />	
	<p><em>Enter JSON API url for this site or another in the format:
	<br />https://rsvpmaker.com/wp-json/rsvpmaker/v1/future
	<br />or
	<br />https://rsvpmaker.com/wp-json/rsvpmaker/v1/type/featured</em></p>
<pre>{typelist}</pre>
</div>);
}

function showFormPrompt () {
    return (<p><em>Click to set options</em></p>);
}

		return (
			<div className={ props.className }>
				<p  class="dashicons-before dashicons-calendar-alt"><strong>RSVPMaker </strong>: Add an Events Listing that dynamically loads via JSON API endpoint
				</p>
			{ isSelected && ( showForm() ) }
			{ !isSelected && ( showFormPrompt() ) }
			</div>
		);
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	save: function( props ) {
		return null;
	},
} );

registerBlockType( 'rsvpmaker/future-rsvp-links', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Future RSVP Links' ), // Block title.
	icon: 'calendar-alt', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'rsvpmaker', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	description: __('Displays a list of links to the RSVP Form for upcoming events with RSVPs turned on'),
	keywords: [
		__( 'RSVPMaker' ),
		__( 'Events' ),
		__( 'Calendar' ),
	],
       attributes: {
            limit: {
                type: 'int',
				default: 5,
            },
            skipfirst: {
                type: 'boolean',
                default: false,
            },
        },
	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	edit: function( props ) {
	const { attributes: { limit, skipfirst }, setAttributes, isSelected } = props;

		return (
			<div className={ props.className }>
				<p  class="dashicons-before dashicons-calendar-alt"><strong>RSVPMaker </strong>: Display a list of links to the RSVP Form for upcoming events
				</p>
<div>
<SelectControl
        label={__("Limit",'rsvpmaker')}
        value={ limit }
        options={ [{label:'3',value: '3'},{label:'5',value: '5'},{label:'7',value: '7'},{label:'10',value: '10'}] }
        onChange={ ( limit ) => { setAttributes( { limit } ) } }
    />
<ToggleControl
        label={__("Skip First Date",'rsvpmaker')}
        checked={ skipfirst }
		help={__('For example, to pick up after an embedded date block that features the first event in the series.')}
        onChange={ ( skipfirst ) => { setAttributes( { skipfirst } ) } }
    />
</div>		
			</div>
		);
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	save: function( props ) {
		return null;
	},
} );

registerBlockType( 'rsvpmaker/countdown', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'RSVPMaker Countdown Timer' ), // Block title.
	icon: 'clock', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'rsvpmaker', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	description: __('Displays a countdown timer for the specified event'),
	keywords: [
		__( 'RSVPMaker' ),
		__( 'Countdown' ),
		__( 'Timer' ),
	],
       attributes: {
            event_id: {
            type: 'string',
            default: '',
            	},
            countdown_id: {
				type: 'string',
				default: '',
				},
            expiration_display: {
				type: 'string',
				default: 'stoppedclock',
				},
			expiration_message: {
				type: 'string',
				default: 'The wait is over!',
				},
			},
	edit: function( props ) {
	const { attributes: { event_id, countdown_id, expiration_display, expiration_message }, setAttributes, isSelected } = props;
	let	current_id = wp.data.select("core/editor").getCurrentPostId();
	let isEvent = ((rsvpmaker.post_type == 'rsvpmaker') && rsvpmaker_ajax._rsvp_first_date);
	setAttributes( { countdown_id : 'countdown-'+current_id } );

	function showFormPrompt () {
		return <div>
		<p><strong>Click here to set options.</strong></p>
		</div>
	}

	function showForm() {
			return (
				<form>
{(!isEvent && <SelectControl
        label={__("Select Event",'rsvpmaker')}
        value={ event_id }
        options={ rsvpupcoming }
        onChange={ ( event_id ) => { setAttributes( { event_id: event_id} ) } }
    />)}
<SelectControl
        label={__("Show When Time Expires",'rsvpmaker')}
        value={ expiration_display }
        options={ [{label: __('Stopped Clock 00:00:00'),value: 'stoppedclock'},{label: __('Stopped Clock Plus Message'),value: 'clockmessage'},{label: __('Message Only'),value: 'message'},{label: __('Nothing, Clear Content'),value: 'nothing'}] }
        onChange={ ( expiration_display ) => { setAttributes( { expiration_display: expiration_display} ) } }
    />
<TextControl label={__('Expiration Message','rsvpmaker')} value={expiration_message} onChange={ ( expiration_message ) => { setAttributes( { expiration_message: expiration_message} ) } } />
	</form>
);
}

		return (
			<div className={ props.className }>
				<p class="dashicons-before dashicons-clock"><strong>RSVPMaker</strong>: Embed a countdown clock.
				</p>
			{ isSelected && ( showForm() ) }
			{ (!isSelected) && ( showFormPrompt() ) }
			</div>
		);
	},

	save: function(props) {
	const { attributes: { event_id, countdown_id, expiration_display, expiration_message } } = props;
	return <div id={countdown_id} event_id={event_id} expiration_display={expiration_display} expiration_message={expiration_message} className={ props.className } ></div>
	},
} );

//default to full screen off for RSVPMaker and related documents
if((rsvpmaker.post_type == 'rsvpemail') || (rsvpmaker.post_type == 'rsvpmaker') || (rsvpmaker.post_type == 'rsvpmaker_template'))
{
	const isFullscreenMode = wp.data.select( 'core/edit-post' ).isFeatureActive( 'fullscreenMode' ); 
	if ( isFullscreenMode ) { 
		wp.data.dispatch( 'core/edit-post' ).toggleFeature( 'fullscreenMode' ); 
	}
}