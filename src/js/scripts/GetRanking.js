// @flow weak

import TrendsAPI from '../api/TrendsAPI';
import type { Term, Geo, Filter, TrendsAPIGraphAverages } from '../util/types';
import terms from '../data/terms';
import countries from '../data/countries';
import { averages } from './data.js';
import log from 'loglevel';

export default class GetRanking {

  data: TrendsAPIGraphAverages;
  term1: Term;
  trendsAPI: TrendsAPI;

  constructor(trendsAPI: TrendsAPI) {
    log.info('Ranking');
    this.data = {
      averages: averages
    };
    this.trendsAPI = trendsAPI;
    // this.term1 = terms.find(t => t.name === 'Influenza');
    // this.term1 = terms.find(t => t.name === 'Abarognosis');
    // this.term1 = terms.find(t => t.name === 'Measles');
    this.term1 = terms.find(t => t.name === 'Amnesia');
    this.callTrendsApi();
  }

  callTrendsApi(){
    const { averages } = this.data;
    const { term1 } = this;
    const index = averages.length;
    const term2 = terms[index];
    const self = this;
    self.trendsAPI.getGraphAverages({
      terms: [term1, term2],
      geo: countries[0],
      startDate: '2016-01',
      endDate: '2016-12',
    }, function(val){
      console.log('From Google Trends: ', val);
      log.info(`${term1.name} ${val.averages[0].value} x ${val.averages[1].value} ${term2.name}`);
      self.updateData(val.averages);
      if (averages.length < terms.length) {
      // if (index < 40) {
        setTimeout(function(){
          self.callTrendsApi(self);
        }, 2000);
      }
    });
  }

  updateData(obj) {
    this.data.averages.push(obj);
    log.info(this.data.averages);
  }

}
