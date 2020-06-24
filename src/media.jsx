import '@babel/polyfill';
import { Icon } from 'react-icons-kit'
import {ic_list} from 'react-icons-kit/md/ic_list'

import { videoData } from './data/data.jsx'

class Media extends React.Component {

    constructor() {
        super();

        this.state = {
            originalPageTitle: document.title,
            videos: this.getVideos(),
            tags: this.getTags(this.getVideos()),
            activeVideoId: 0,
            activeTags: ['All'],
        }

        this.onVideoClick = this.onVideoClick.bind(this);
        this.onTagClick = this.onTagClick.bind(this);
    }

    componentDidMount() {

        window.addEventListener("beforeunload", function (event) {
            this.updateVideoPosition(this.state.activeVideoId);
        })

        var videoId =  window.location.hash
        if(videoId){
            this.onVideoClick(videoId.replace('#',''))
        }
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", function (event) {
            this.updateVideoPosition(this.state.activeVideoId);
        })
    }
    updateBreadCrumb(id){
        
        const {videos} = this.state;
        var item = videos.filter( x => x.id == id)[0];
        if(!item){
            $('.breadCrumb .videoItem').html(``);
            return;
        }
        if(!$('.breadCrumb .videoItem').length){
            $('.breadCrumb').append(`<a class='videoItem'> > ${item.title}</a>`);
        }
        else{
            $('.breadCrumb .videoItem').html(`> ${item.title}`);
        }
       


    }
    updateVideoPosition(id) {

        var vid = document.getElementById(`videoItem_${this.state.activeVideoId}`);
        if (vid) {
            localStorage.setItem(`${this.state.activeVideoId}.currentTime`, vid.currentTime);

        }
    }

    getVideos() {
        // var activeBrand =  $("[data-name='activeBrand']").attr('data-brand');
        // return videoData.filter(x => x.brand == activeBrand);
        return videoData
    }
    getTags(videos) {
     
        var tagList = videos.map(x => { return x.tags })
        var Alltags = [].concat.apply([], tagList);

        var tags = ['All', ...new Set(Alltags)];


        return tags;
    }
    onVideoClick(id) {
        const {videos,originalPageTitle} = this.state;

        var videoItem = videos.filter(x => x.id == id)[0];
        this.updateVideoPosition(this.state.activeVideoId);

        this.setState({ activeVideoId: id }, () => {
            if (id != 0) {
                window.scrollTo(0, 0);
                this.playVideo(id);
               
            }
            this.updateBreadCrumb(id);
            window.location.hash = id;
            if(videoItem){
                document.title = `${videoItem.title} - ${document.title}`;
            }
            else{
                document.title = originalPageTitle;
            }
            
        })

    }
    onTagClick(tag) {
        if (tag != "All") {
            var activeTags = this.state.activeTags;
            if (activeTags.indexOf(tag) == -1) {
                activeTags.shift("All");
                activeTags.push(tag);
               
                this.setState({ activeTags: activeTags }, () => { });
            }
        }
        else {
            this.setState({ activeTags: ["All"] }, () => { });
        }
    }
    getTagState(tag) {
        var value = '';
        var activeTags = this.state.activeTags;
        if (activeTags.indexOf(tag) != -1) {
            value = 'active';
        }
        return value;
    }
    playVideo(id) {
        var vid = document.getElementById(`videoItem_${id}`);
        var handler = function(event){
            vid.removeEventListener("canplay", handler, false);

            vid.currentTime = position;   //specified time
        }
        if (!vid) {
            return;
        }
        if (localStorage.getItem(`${id}.currentTime`)) {

            var position = localStorage.getItem(`${id}.currentTime`)
            vid.addEventListener("canplay", handler, false)
        }


        vid.play();


    }

    stickyVideoContainer(){
        var scroll = $(window).scrollTop();
        if (scroll > 100){
            console.log("scroll is more than 100")
        }
        else{
            console.log("scroll is less than 100")
        }
    }

    render() {
        const { title, videos, activeVideoId, tags, activeTags } = this.state;

        var videoItem = videos.filter(x => x.id == activeVideoId)[0];
        var tagstoCompare = videoItem ? videoItem.tags : activeTags
        var filteredVideos = activeTags.includes("All") && !videoItem ? videos : videos.filter(x => tagstoCompare.every(e => x.tags.includes(e)));
       
        console.log("Title", title)
        console.log("Videos", videos)
        console.log("Active video id", activeVideoId)
        console.log("Tags", tags)
        console.log("Active tags", activeTags)
        console.log("Video item", videoItem)
        console.log("tagsToCompare", tagstoCompare)
        console.log("Filtered videos", filteredVideos)
        return (
            <div className=" pure-g video-list">
                {videos &&
                    <div>
                        {videoItem &&

                            <div className="pure-u-1 pure-u-sm-24-24 pure-u-md-24-24 pure-u-lg-18-24 video-item" >
                                {videoItem.type === 'youtube' &&
                                    <div className="videoWrapper"><iframe width="560" height="349" 
                                        src={`https://www.youtube.com/embed/${videoItem.src}?autoplay=1`}>
                                    </iframe></div>
                                }
                                {videoItem.type != 'youtube' &&
                                    <video key={videoItem.src} id={`videoItem_${videoItem.id}`} poster={videoItem.src.replace(/\.mp(?:3|4)$/, ".png")} width="100%" controls>
                                        <source src={videoItem.src} type="video/mp4" />
                                    </video>
                                }

                                <h2>{videoItem.title}</h2>

                                {videoItem.speaker && <h3>{videoItem.speaker}</h3>}

                                <p>{videoItem.publishedDate}</p>
                                <ul>
                                    {videoItem.tags.map(t => {
                                        return <li key={t}>{t}</li>
                                    }
                                    )}
                                </ul>

                            </div>}
                        <div className={` pure-u-1 pure-u-md-24-24 pure-u-lg-${videoItem ? '6' : '24'}-24`}>
                            {!videoItem &&  <div className="navigation-wrapper" > <ul className="tag-navigation">{tags.map(t => { return <li style={{cursor: "pointer"}} key={t} className={this.getTagState(t)}><a  style={{cursor: "pointer"}}  onClick={this.onTagClick.bind(this, t)}>{t}</a></li> })}</ul></div>}
                            <div className="pure-g ">


                                {videoItem && <a className="list-button" onClick={this.onVideoClick.bind(this, 0)} title="Back to list"><i className='fa fa-th'>&nbsp;</i><Icon icon={ic_list} size={32}/> Back to list</a>}
                                {filteredVideos.filter(x => x.id != activeVideoId).map(x => {
                                    return <div key={x.id} className={`pure-u-1 pure-u-sm-24-24 pure-u-md-24-24  pure-u-lg-${videoItem ? '24' : '8'}-24`}>
                                        <div className="video-list-item" onClick={this.onVideoClick.bind(this, x.id)}>
                                            
                                            
                                            
                                            <img src={x.type==='youtube'?`http://i.ytimg.com/vi/${x.src}/hqdefault.jpg`:x.image} className="video-nav" onClick={this.onVideoClick.bind(this, x.id)} width="100%" ></img>

                                            
                                            
                                            <div className="video-name-block">
                                                <h2>{x.title}</h2>
                                                {x.speaker && <h3>{x.speaker}</h3>}
                                                <p>{x.publishedDate}</p>
                                                <ul>
                                                    {x.tags.map(t => {
                                                        return <li  key={t}>{t}</li>
                                                    }
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                })
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

const containerElement = document.getElementById('content');
ReactDOM.render(<Media />, containerElement);