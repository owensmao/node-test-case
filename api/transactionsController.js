'use strict';

var Transactions = require( '../models/transactions.model.js' );
var config = require( '../config' );
var Stripe = require( 'stripe' )( config.stripeApiKey );

exports.index = function( req, res, next ) {
    if ( req.body ) {
        var transaction = new Transactions( {
            name: req.body.name
        } );
        transaction.save( function( err, trans ) {
            if ( err ) {
                return console.log( err );
            }
            res.status( 200 ).end();
        } );
    }
};

exports.createTransaction = function( req, res, next ) {
    /***
     * Validation for parameters firstly
     */

    if(!req.body.amount){
        return res.json( {
            success: false,
            message: 'amount can\'t be empty.'
        } );
    }

    if(isNaN(req.body.amount)){
        return res.json( {
            success: false,
            message: 'invalid amount .'
        } );
    }

    if(!req.body.currency){
        return res.json( {
            success: false,
            message: 'currency can\'t be empty.'
        } );
    }

    Stripe.charges.create( {
        amount: req.body.amount,
        currency: req.body.currency,
        source: req.body.token,
        description: 'Charge for test@example.com'
    }, function( err, charge ) {
        if ( err ) {
            console.log( err );
            return res.status( 500 );
        }


        var transaction = new Transactions( {
            transactionId: charge.id,
            amount: charge.amount,
            created: charge.created,
            currency: charge.currency,
            description: charge.description,
            paid: charge.paid,
            sourceId: charge.source.id
        } );

        transaction.save( function( err ) {
            if ( err ) {
                return res.status( 500 );
            }
            else {
                res.status( 200 ).json( {
                    message: 'Payment is created.'
                } );
            }
        } );
            // asynchronously called
    } );
};
