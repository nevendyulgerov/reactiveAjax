
import reactiveAjax from '../dist/reactive-ajax';
const apiEndpoint: string = 'https://ghibliapi.herokuapp.com';


// define request handler
const handleRequest = (resolve: any, options: any, abort: any) => {
  if (!options.isRequestFullfilled && options.getRequestElapsedTime() > 100) {
    return abort();
  }
  resolve(!options.isRequestFullfilled);
};

// define request handler
const handleComplete = (options: { isRequestFullfilled: boolean, requestTime: any }) => {
  console.log(options);
};

// intercept clicks
document.querySelector('[data-trigger]').addEventListener('click', () => {

  // define request
  const filmsRequest: {url: string, callback: (err: any, films: any) => void} = {
    url: `${apiEndpoint}/films`,
    callback: (err: any, films: any) => console.log(films)
  };

  // run reactive request
  reactiveAjax(filmsRequest)
    .filter((film: any) => film.rt_score > 90)
    .run()
    .watch(handleRequest, handleComplete, 50);
});
