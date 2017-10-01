// @flow weak

import type { Filter } from '../util/types';
import { Keys } from '../../keys/Keys';
import log from 'loglevel';

export default class TrendsAPI {

  gapi: () => {};
  delay: number;

  constructor() {
    log.info('TrendsAPI');
  }

  setup(callback) {
    const self = this;
    self.delay = 0;
    require( 'google-client-api' )()
      .then( function( gapi ) {
        log.info('GoogleAPI library loaded');
        gapi.load('client', start);

        function start() {
          let apiKey, id;
          if (ENV === 'PRODUCTION') {
            apiKey = Keys['PRODUCTION'];
            id = 'diseases-production';
          } else {
            apiKey = Keys['DEVELOPMENT'];
            id = 'diseases';
          }

          gapi.client.init({
            'apiKey': apiKey,
            'clientId': 'diseases.apps.googleusercontent.com',
          })
          .then(function(){
            log.info('GoogleAPI client initialized');
            self.gapi = gapi;
            if (callback) {
              callback();
            }
          })
        }
      });
  }

  executeCall(path: string, callback) {
    const self = this;
    this.gapi.client.request({
      'path': path
    })
    .then(function(response) {
        callback(response.result);
      }, function(reason) {
        log.info('Error: ' + reason.result.error.message);
        if (reason.result.error.code === 429 && self.delay < 8) {
          setTimeout(function() {
            self.executeCall(path, callback);
          }, (self.delay = Math.max(self.delay *= 2, 1)) * 1000);
        }
      }
    );
  }

  appendRestrictions(filter: Filter, path: string) {
    const { geo, startDate, endDate } = filter;
    if (geo && geo.iso !== 'world') {
      path += `&restrictions.geo=${geo.iso}`;
    }
    if (filter.startDate) {
      path += `&restrictions.startDate=${filter.startDate}`;
    }
    if (filter.endDate) {
      path += `&restrictions.endDate=${filter.endDate}`;
    }
    return path;
  }

  getGraph(filter: Filter, callback) {
    log.info('getGraph for:', filter);
    const { geo, terms } = filter;
    let path = 'https://www.googleapis.com/trends/v1beta/graph?';
    for (const t of terms) {
      path += 'terms=' + encodeURIComponent(t.entity) + '&';
    }
    path = this.appendRestrictions(filter, path);
    this.executeCall(path, callback);
  }

  getGraphAverages(filter: Filter, callback) {
    // log.info('getGraphAverages for:', filter);
    const { terms } = filter;
    let path = 'https://www.googleapis.com/trends/v1beta/graphAverages?';
    for (const t of terms) {
      path += 'terms=' + encodeURIComponent(t.entity) + '&';
    }
    path = this.appendRestrictions(filter, path);
    this.executeCall(path, callback);
  }

  getTopQueries(filter: Filter, callback) {
    log.info('getTopQueries for:', filter);
    const { geo, terms } = filter;
    const term = terms[0];
    let path = `https://www.googleapis.com/trends/v1beta/topQueries?term=${encodeURIComponent(term.entity)}`;
    path = this.appendRestrictions(filter, path);
    this.executeCall(path, callback);
  }

  getTopTopics(filter: Filter, callback) {
    log.info('getTopQueries for:', filter);
    const { geo, terms } = filter;
    const term = terms[0];
    let path = `https://www.googleapis.com/trends/v1beta/topTopics?term=${encodeURIComponent(term.entity)}`;
    path = this.appendRestrictions(filter, path);
    this.executeCall(path, callback);
  }

  getRegionsList(filter: Filter, callback) {
    log.info('getRegionsList for:', filter);
    const { geo, terms } = filter;
    const term = terms[0];
    let path = `https://www.googleapis.com/trends/v1beta/regions?term=${encodeURIComponent(term.entity)}`;
    path = this.appendRestrictions(filter, path);
    this.executeCall(path, callback);
  }
}
