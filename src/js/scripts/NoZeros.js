// @flow weak

// Components
import TrendsAPI from '../api/TrendsAPI';
import type { Term, Geo, Filter } from '../util/types';
import terms from '../data/terms';
import countries from '../data/countries';

export class NoZeros {

  data: {
    diseases: string,
    i: number
  }
  trendsAPI: TrendsAPI;

  constructor() {
    this.data = {
      diseases: '',
      i: 2325
    }
    const self = this;
    this.trendsAPI = new TrendsAPI();
    this.trendsAPI.setup(function(){
      self.callTrendsApi(self);
    });

  }

  callTrendsApi(self){
    let { i, diseases } = self.data;

    self.trendsAPI.getTrends({terms: [terms[i]], geo: countries[0]}, function(val){
      console.log('From Google Trends: ', val);

      let hasData = 0;
      for (const p of val.lines[0].points) {
        if (p.value !== 0) {
          hasData = 1;
          break;
        }
      }

      self.updateData({
          diseases: diseases + hasData + '\t' + terms[i].name + '\t' + terms[i].entity + '\n',
          i: i+1
      })

      if (i < terms.length - 1) {
        setTimeout(function(){
          self.callTrendsApi(self);
        }, 1000);
      }
    });
  }

  updateData(obj) {
    let { data } = this;
    for (const key in obj) {
      data[key] = obj[key];
    }
    this.data = data;
    console.log(this.data);
  }

}
