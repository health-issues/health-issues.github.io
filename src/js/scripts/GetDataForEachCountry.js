// @flow weak

import TrendsAPI from '../api/TrendsAPI';
import ShinyAPI from '../api/ShinyAPI';
import type { Term, Geo, Filter, TrendsAPIGraph } from '../util/types';
import terms from '../data/terms';
import countries from '../data/countries';
import log from 'loglevel';

export default class GetDataForEachCountry {

  data: {
    seasonal: TrendsAPIGraph[],
    trend: TrendsAPIGraph[],
    geo: Geo,
    terms: Term[],
  };

  constructor(shinyAPI: ShinyAPI, trendsAPI: TrendsAPI) {
    log.info('GetDataForEachCountry');
    this.trendsAPI = trendsAPI;
    this.shinyAPI = shinyAPI;
    this.data = {
      seasonal: [],
      trend: [],
      geo = countries[0];
      terms = [terms.find(t => t.name === 'Gout')];
    };
    // this.callTrendsApi();
  }

  // callTrendsApi(){
  //   const { terms, geo } = this;
  //   const self = this;
  //   self.trendsAPI.getGraph({ terms, geo }, function(val){
  //     log.info('From Google Trends: ', type);
  //     log.info(val);
  //     const dataToR = self.parseDataToR(type);
  //     shinyAPI.updateData(type, dataToR);
  //   });
  // }
  //
  // parseDataToR(type: string) {
  //   log.info('parseDataToR', type);
  //   const { total, totalPerLine } = this.data;
  //   const { shinyAPI } = this;
  //   const index = this.data[type].length;
  //   const whichTotal = type === 'trend' ? total : totalPerLine;
  //   return whichTotal[index].points.map((p, i) => p.date+','+p.value);
  // }
  //
  // parseDataFromR(dataFromR) {
  //   log.info('parseDataFromR');
  //   const { terms, seasonal, trend } = this.data;
  //   const type = dataFromR.indexOf('trend') > -1 ? 'trend' : 'seasonal';
  //   const index = this.data[type].length;
  //   const newDataString = dataFromR.substring(
  //     dataFromR.indexOf(type) + type.length + 1);
  //   let newData = (newDataString.split(','));
  //   if (type === 'seasonal') {
  //     newData = newData.slice(0, 13);
  //   }
  //   return (
  //     newData.map((n, i) => {
  //       const date = total[0].points[i].date;
  //       const value = (Math.round(Number(n.trim())*100))/100;
  //       return { date, value };
  //     })
  //   )
  // }

  updateData(obj) {
    this.data.seasonal.push(obj);
    log.info(this.data);
  }

}
