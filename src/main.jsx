import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './portfolio.css';

import { projects } from './projects';
import FoldText from './FoldText';
import CursorParticles from './CursorParticles';

const advantages = [
  ['04','从洞察开始','RESEARCH','把用户感受变成设计依据。结合问卷、实地观察与数据分析，理解场景中的真实需求。','用户研究 / Excel / SPSS / GIS'],
  ['07','跨尺度设计','DESIGN','在空间、产品与视觉之间切换，从方案构思到模型推敲，让想法拥有清晰的形态。','Rhino / SketchUp / CAD / Figma'],
  ['05','让表达被看见','STORYTELLING','将复杂信息转化为图像、视频与内容。兼顾视觉完成度与传播目标，推动方案落地。','PS / AI / Blender / Ae / Pr'],
  ['06','持续探索与协作','EXPLORATION','探索 AIGC 与新的创作方法，在调研、设计和执行中保持学习，协同团队完成交付。','Midjourney / SD / Enscape / D5'],
];
const GROUPS = [
  ['group-media','新媒体运营','NEW MEDIA OPERATIONS',['01']],
  ['group-visual','视觉设计','VISUAL DESIGN',['02','03']],
  ['group-space','空间设计','SPACE DESIGN',['04','05','06','07']],
  ['group-service','产品设计','PRODUCT DESIGN',['08','09']],
];
const TOC_COLORS = ['#5E7FA3','#C98D90','#778D72','#DDA164','#4C514D'];
function Arrow({diagonal=false}){return <span aria-hidden="true">{diagonal?'↗':'↗'}</span>}
function ColorBlocks({position}){
  const colors=position==='ending'?['#dda164','#4c514d','#778d72','#c98d90','#669083','#5e7fa3']:position==='top'?['#dda164','#4c514d','#778d72']:['#669083','#c98d90','#5e7fa3'];
  return <div className={`cover-blocks cover-blocks-${position}`} aria-hidden="true">{colors.map((color,index)=><i key={color} style={{backgroundColor:color,'--block-index':index}}/>)}</div>
}
function CoverArtwork({ending=false,onCopy,onCopyPhone}){
  const artwork=useRef(null);
  const [copyTarget,setCopyTarget]=useState(null);
  useEffect(()=>{
    const node=artwork.current;
    const observer=new IntersectionObserver(([entry])=>node.classList.toggle('is-visible',entry.isIntersecting),{threshold:.28});
    observer.observe(node);
    return()=>observer.disconnect();
  },[]);
  return <div ref={artwork} className={`animated-cover ${ending?'animated-ending':''}`}>
    <div className="cover-pink-panel" aria-hidden="true"/>
    <div className="cover-rule cover-rule-vertical" aria-hidden="true"/><div className="cover-rule cover-rule-horizontal" aria-hidden="true"/>
    {ending?<><div className="ending-row"><ColorBlocks position="ending"/><p className="thanks-note">Thank you for watching</p></div><div className="cover-word ending-word">THANKS<span>.</span></div><div className="cover-year ending-year">2026</div><div className="cover-vertical-copy ending-vertical-copy">Personal Design Portfolio</div><div className="ending-contact"><span className="eyebrow">LET’S KEEP IN TOUCH</span><p>期待与你的下一次交流。</p><div className="ending-contact-items"><div><span>EMAIL</span><div><a href="mailto:491134402@qq.com" onClick={e=>{e.preventDefault();setCopyTarget(t=>t==='email'?null:'email')}}>491134402@qq.com</a><button className={copyTarget==='email'?'copy-pop show':'copy-pop'} onClick={()=>{onCopy();setCopyTarget(null)}} aria-label="复制邮箱">复制 ↗</button></div></div><div><span>PHONE</span><div><a href="tel:18571920830" onClick={e=>{e.preventDefault();setCopyTarget(t=>t==='phone'?null:'phone')}}>+86 185 7192 0830</a><button className={copyTarget==='phone'?'copy-pop show':'copy-pop'} onClick={()=>{onCopyPhone();setCopyTarget(null)}} aria-label="复制手机号">复制 ↗</button></div></div></div></div></>:<><ColorBlocks position="top"/><ColorBlocks position="bottom"/><div className="cover-word">PORTFOLIO</div><div className="cover-year">2026</div><div className="cover-vertical-copy">Personal Design Portfolio</div><a className="cover-cta" href="#contents" aria-label="翻开作品集，跳转到作品目录"><FoldText text="翻开作品集" hinge="top" duration={0.62} stagger={0.065} repeatDelay={1.2} creaseShading={0} trailing={<span className="cover-cta-arrow" style={{WebkitMaskImage:`url(${import.meta.env.BASE_URL+'images/arrow-curly.png'})`,maskImage:`url(${import.meta.env.BASE_URL+'images/arrow-curly.png'})`}} aria-hidden="true"/>}/></a><p className="cover-author">Design by Shen Tanmeng</p></>}
  </div>
}
function TypeBlock({as:Tag='span',lines,speed=50,started=false,onDone}){
  const reduce=typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const total=lines.join('').length;
  const [n,setN]=useState(reduce?total:0);
  useEffect(()=>{
    if(!started||reduce)return;
    let i=0,timer;
    const tick=()=>{i++;setN(i);if(i<total)timer=setTimeout(tick,speed);else onDone&&onDone();};
    timer=setTimeout(tick,260);
    return()=>clearTimeout(timer);
  },[started]);
  let gi=0;
  return <Tag aria-hidden="true">
    {lines.map((line,li)=>{
      const chars=[...line].map((ch,k)=>{
        const idx=gi++;
        const caret=idx===n&&started&&!reduce&&n<total?<i className="type-caret" aria-hidden="true"/>:null;
        return <React.Fragment key={k}><span className={'type-ch'+(idx<n?' on':'')}>{ch}</span>{caret}</React.Fragment>;
      });
      return <React.Fragment key={li}>{li>0&&<br/>}{chars}</React.Fragment>;
    })}
  </Tag>;
}
function MediaBook({project}){
  const P=project.pages;
  // Deck uses lightweight preview derivatives; the dialog keeps full-resolution originals.
  const pv=src=>src.replace('/portfolio/media-','/portfolio/preview/media-');
  const ref=useRef(null);
  const track=useRef(null);
  const [vis,setVis]=useState(false);
  const [order,setOrder]=useState(()=>P.map((_,i)=>i)); // order[0] = top card
  const [dx,setDx]=useState(0);
  const [dragging,setDragging]=useState(false);
  const [fly,setFly]=useState(null); // {dir,dx,idx,key}
  const busy=!!fly;
  const reduce=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(()=>{
    const node=ref.current;if(!node)return;
    if(reduce()){setVis(true);return;}
    const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);ob.disconnect();}},{threshold:.2});
    ob.observe(node);return()=>ob.disconnect();
  },[]);
  useEffect(()=>{
    document.documentElement.classList.toggle('is-page-turning',busy||dragging);
    return()=>{document.documentElement.classList.remove('is-page-turning');};
  },[busy,dragging]);
  useEffect(()=>{P.forEach(p=>{const im=new Image();im.src=pv(p.src);if(im.decode)im.decode().catch(()=>{});});},[project]);
  const throwCard=(dir,startDx=0)=>{
    if(busy)return;
    if(reduce()){setOrder(o=>[...o.slice(1),o[0]]);setDx(0);return;}
    setOrder(o=>[...o.slice(1),o[0]]);
    setFly({dir,dx:startDx,idx:order[0],key:Date.now()});
    setDx(0);
  };
  const jumpTo=i=>{
    if(busy)return;
    setOrder(o=>{const k=o.indexOf(i);return k<0?o:[...o.slice(k),...o.slice(0,k)];});
  };
  const stageW=()=>ref.current?ref.current.offsetWidth:860;
  const onPointerDown=e=>{
    if(busy||e.button)return;
    e.currentTarget.setPointerCapture(e.pointerId);
    track.current={x0:e.clientX,vx:0,lastX:e.clientX,lastT:performance.now()};
    setDragging(true);
  };
  const onPointerMove=e=>{
    const t=track.current;if(!t)return;
    const now=performance.now(),dt=now-t.lastT;
    if(dt>4){t.vx=.7*((e.clientX-t.lastX)/dt)+.3*t.vx;t.lastX=e.clientX;t.lastT=now;}
    setDx(e.clientX-t.x0);
  };
  const onPointerUp=()=>{
    const t=track.current;if(!t)return;
    track.current=null;
    setDragging(false);
    const far=Math.abs(dx)>stageW()*.26,fast=Math.abs(t.vx)>.55;
    if(far||fast)throwCard(dx>0?1:-1,dx);
    else setDx(0); // spring back
  };
  const prog=dragging||dx?Math.min(Math.abs(dx)/(stageW()*.5),1):0;
  const POSE=[[-2,1,0],[3.5,.955,12],[-5,.915,22],[6,.88,30]]; // [rotate, scale, offsetY] per stack position
  return <div ref={ref} className={'media-book'+(vis?' is-visible':'')}>
    <div className="deck-stage">
      <button className="book-hit" onClick={()=>throwCard(-1)} disabled={busy} aria-label="扔走上一张">‹</button>
      <div className="deck">
        {order.map((idx,pos)=>{
          const p=P[idx];
          const [r0,s0,y0]=POSE[pos]||[-6,.85,34];
          let style;
          if(pos===0){
            const r=Math.max(-9,Math.min(9,-2+dx*.02));
            style={transform:'translate('+dx+'px,'+y0+'px) rotate('+r+'deg) scale(1)'};
          }else if(pos===1){
            style={transform:'translateY('+(12*(1-prog))+'px) rotate('+(3.5*(1-prog))+'deg) scale('+(.955+.045*prog)+')'};
          }else{
            style={transform:'translateY('+y0+'px) rotate('+r0+'deg) scale('+s0+')'};
          }
          const top=pos===0;
          return <div key={idx} className={'deck-card '+(top?'deck-top':'deck-under deck-pos-'+pos)+(top&&dragging?' is-drag':'')} style={style}
            onPointerDown={top?onPointerDown:undefined} onPointerMove={top?onPointerMove:undefined}
            onPointerUp={top?onPointerUp:undefined} onPointerCancel={top?onPointerUp:undefined}
            aria-label={top?('当前页：'+p.caption+'，可左右拖动切换'):undefined}>
            <img src={pv(p.src)} alt={top?p.name+'：'+p.caption:''} draggable={false} loading={pos<2?'eager':'lazy'}/>
          </div>;
        })}
        {fly&&<div key={fly.key} className="deck-card deck-fly" aria-hidden="true"
          style={{'--sx':fly.dx+'px','--sr':Math.max(-9,Math.min(9,-2+fly.dx*.02))+'deg','--tx':fly.dir*(stageW()*1.3)+'px','--tr':fly.dir*18+'deg'}}
          onAnimationEnd={e=>{if(e.target===e.currentTarget)setFly(null);}}>
          <img src={pv(P[fly.idx].src)} alt=""/>
        </div>}
      </div>
      <button className="book-hit" onClick={()=>throwCard(1)} disabled={busy} aria-label="扔走上一张">›</button>
    </div>
    <div className="book-dots">{P.map((_,i)=><button key={i} className={'book-dot'+(i===order[0]?' is-active':'')} onClick={()=>jumpTo(i)} disabled={busy} aria-label={'把第'+(i+1)+'页换到最上层'}/>)}</div>
  </div>
}
function App(){
  const [project,setProject]=useState(null); const [menu,setMenu]=useState(false); const [notice,setNotice]=useState(''); const [flipCount,setFlipCount]=useState(0);
  const [aboutGo,setAboutGo]=useState(false); const [aboutT1,setAboutT1]=useState(false);
  const [aboutVis,setAboutVis]=useState(false);
  const aboutCopyRef=useRef(null); const aboutSectionRef=useRef(null);
  useEffect(()=>{
    const node=aboutSectionRef.current;
    if(!node)return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setAboutVis(true);setAboutGo(true);setAboutT1(true);return;}
    let typeTimer;
    const ob=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){
        setAboutVis(true);
        typeTimer=setTimeout(()=>setAboutGo(true),1100);
        ob.disconnect();
      }
    },{threshold:.18});
    ob.observe(node);
    return()=>{ob.disconnect();clearTimeout(typeTimer);};
  },[]);
  useEffect(()=>{
    const node=aboutCopyRef.current;
    if(!node)return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setAboutGo(true);setAboutT1(true);setAboutT2(true);return;}
    const ob=new IntersectionObserver(([e])=>{if(e.isIntersecting){setAboutGo(true);ob.disconnect();}},{threshold:.3});
    ob.observe(node);
    return()=>ob.disconnect();
  },[]);
  const tocRef=useRef(null);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const node=tocRef.current;
    if(!node)return;
    let timers=[];let stopped=false;let started=false;
    const wait=ms=>new Promise(r=>{const t=setTimeout(r,ms);timers.push(t);});
    const run=async()=>{
      while(!stopped){
        for(let c=1;c<=GROUPS.length;c++){setFlipCount(c);await wait(600);}
        await wait(3800);
        for(let c=GROUPS.length-1;c>=0;c--){setFlipCount(c);await wait(600);}
        await wait(5000);
      }
    };
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting&&!started){started=true;run();}
    },{threshold:.25});
    observer.observe(node);
    return()=>{stopped=true;timers.forEach(clearTimeout);observer.disconnect();};
  },[]);
  useEffect(()=>{
    const els=[...document.querySelectorAll('.reveal')];
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(el=>el.classList.add('is-in'));return;}
    const ob=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');ob.unobserve(e.target);}});
    },{threshold:0,rootMargin:'0px 0px -8% 0px'});
    els.forEach(el=>ob.observe(el));
    return()=>ob.disconnect();
  },[]);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const els=[...document.querySelectorAll('.section-heading h2')];
    let raf=0;
    const onScroll=()=>{
      if(raf)return;
      raf=requestAnimationFrame(()=>{
        raf=0;
        const vh=window.innerHeight;
        els.forEach(el=>{
          const r=el.getBoundingClientRect();
          if(r.bottom<-80||r.top>vh+80)return;
          const p=(r.top+r.height/2-vh/2)/vh;
          el.style.transform='translateY('+(p*-24)+'px)';
        });
      });
    };
    onScroll();
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll);
    return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);if(raf)cancelAnimationFrame(raf);};
  },[]);
  const lastTrigger=useRef(null);
  const [zoom,setZoom]=useState(null);
  useEffect(()=>{document.body.style.overflow=(project||zoom)?'hidden':'';},[project,zoom]);
  useEffect(()=>{
    if(!project&&!zoom)return;
    const f=e=>{if(e.key!=='Escape')return;if(zoom)setZoom(null);else close();};
    window.addEventListener('keydown',f);
    return()=>window.removeEventListener('keydown',f);
  },[project,zoom]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),2800);return()=>clearTimeout(timer);},[notice]);
  useEffect(()=>{
    const closeMenu=event=>{if(event.key==='Escape')setMenu(false)};
    const resetMenu=()=>{if(window.innerWidth>=768)setMenu(false)};
    window.addEventListener('keydown',closeMenu);window.addEventListener('resize',resetMenu);
    return()=>{window.removeEventListener('keydown',closeMenu);window.removeEventListener('resize',resetMenu)};
  },[]);
  function close(){setProject(null);setZoom(null);lastTrigger.current?.focus();}
  async function copy(text,ok,fallback){try{await navigator.clipboard.writeText(text);setNotice(ok);}catch{setNotice(fallback);}}
  return <>
    <CursorParticles/>
    <header className="header"><a className="brand" href="#home" aria-label="沈谭梦 首页"><img className="brand-mark" src={import.meta.env.BASE_URL+'images/dream-logo.svg'} alt="" width="875" height="225"/><span>沈谭梦<small>DESIGN PORTFOLIO</small></span></a><button className="menu-toggle" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-controls="main-navigation" aria-label={menu?'关闭导航菜单':'打开导航菜单'}><span className="menu-toggle-label">MENU</span><span className="hamburger" aria-hidden="true"><i/><i/><i/></span></button><nav id="main-navigation" className={menu?'nav open':'nav'} aria-label="主导航">{[['about','关于我'],['group-media','新媒体运营'],['group-visual','视觉设计'],['group-space','空间设计'],['group-service','产品设计']].map(([id,text])=><a href={'#'+id} key={id+text} onClick={()=>setMenu(false)}>{text}</a>)}<a className="nav-mobile-contact" href="#contact" onClick={()=>setMenu(false)}>联系我 <Arrow/></a></nav><a className="contact-nav" href="#contact">联系我 <Arrow/></a></header>
    <main>
      <section className="portfolio-hero" id="home" aria-labelledby="site-title">
        <h1 id="site-title" className="sr-only">沈谭梦 · 个人设计作品集</h1>
        <div className="cover-stage"><CoverArtwork/></div>
        <div className="cover-caption shell"><span>空间 · 产品 · 视觉 · 新媒体</span></div>
      </section>
      <section className={'about shell section'+(aboutVis?' is-visible':'')} ref={aboutSectionRef} id="about"><div className="section-label"><span>01 / ABOUT ME</span><span>ABOUT ME / 关于我</span></div><div className="about-grid about-text-only"><div className="about-copy" ref={aboutCopyRef}><span className="eyebrow muted">BEYOND A SINGLE DISCIPLINE</span><h2 aria-label="保持好奇，让想法落地。"><TypeBlock lines={['保持好奇，','让想法落地。']} speed={95} started={aboutGo} onDone={()=>setAboutT1(true)}/></h2><p className={'about-p'+(aboutT1?' on':'')} aria-label="你好，我是沈谭梦。目前就读于中南大学设计专业硕士，本科毕业于武汉理工大学设计学类。">你好，我是沈谭梦。<br/>目前就读于中南大学设计专业硕士，本科毕业于武汉理工大学设计学类。</p><p className={'about-p about-p-2'+(aboutT1?' on':'')} aria-label="我的实践横跨空间、产品、视觉与新媒体运营。从公共空间调研到智能产品建模，从影像制作到内容策划，我习惯以用户洞察为起点，将想法转化为可感知、可使用、可传播的体验。">我的实践横跨空间、产品、视觉与新媒体运营。从公共空间调研到智能产品建模，从影像制作到内容策划，我习惯以用户洞察为起点，将想法转化为可感知、可使用、可传播的体验。</p></div></div></section>
      <div className="shell awards-strip"><div className="awards reveal"><span>RECOGNITION / 设计荣誉</span><p>“包豪斯”设计大赛 · 全国一等奖 <i>/</i> 好创意设计大赛 · 全国二等奖 <i>/</i> 华灿奖 · 全国优秀奖 <i>/</i> 香港数字艺术大赛 · 全国一等奖</p></div></div>
      <section className="contents section" id="contents" aria-labelledby="contents-title"><div className="shell"><div className="section-label reveal"><span>02 / CONTENTS</span><span>CONTENTS / 目录</span></div><div className="section-heading reveal" style={{'--d':'90ms'}}><div><span className="editorial-title">Contents.</span><h2 id="contents-title">作品目录</h2></div></div><div className="toc-grid reveal" ref={tocRef} style={{'--d':'160ms'}}>{GROUPS.map(([gid,gtitle,gen,ids],i)=>{const backProject=projects.find(p=>p.id===ids[0]);const backSrc=gid==='group-visual'?'/portfolio/video-03.jpg':backProject.image;return(<a className="toc-card" href={'#'+gid} key={gid} aria-label={gtitle}><span className={'toc-flip'+(i<flipCount?' is-flipped':'')}><span className="toc-face toc-front" style={{background:TOC_COLORS[i]}}><span className="toc-num">{String(i+1).padStart(2,'0')} /</span><strong className="toc-name">{gtitle}</strong><span className="toc-meta"><span className="toc-en">{gen}</span><span className="toc-count">{String(ids.length).padStart(2,'0')} PROJECTS <Arrow/></span></span></span><span className="toc-face toc-back" aria-hidden="true"><img src={backSrc} alt=""/></span></span></a>)})}</div></div></section>
      <section className="projects section" id="projects"><div className="shell"><div className="section-label reveal"><span>03 / MY PROJECTS</span><span>空间、文化与人的连接。</span></div><div className="section-heading reveal" style={{'--d':'90ms'}}><div><h2>作品项目</h2></div><p>从图像语言到空间叙事，<br/>从单一媒介到完整体验。</p></div><div className="project-groups">{GROUPS.map(([gid,gtitle,gen,ids])=>{const items=ids.map(id=>projects.find(p=>p.id===id)).filter(Boolean);const horizontal=items.length>1;const isTwo=items.length===2;return(<div className="project-group" id={gid} key={gid}><div className="group-head reveal"><h3>{gtitle}<span className="accent">.</span></h3><span>{gen} / {String(gid==='group-media'?items[0].pages.length:items.length).padStart(2,'0')} {gid==='group-media'?'CARDS':'PROJECTS'}</span></div>{gid==='group-media'?<MediaBook project={items[0]}/>:<div className={'project-grid reveal'+(horizontal?' project-horizontal':'')+(isTwo?' project-two':'')}>{items.map((p,index)=><button className={'project-card project-'+p.id+(horizontal&&index===0?' is-featured':'')} key={p.id} style={{'--project-color':p.color}} onClick={e=>{lastTrigger.current=e.currentTarget;setProject(p);}} aria-label={'查看'+p.name+'，共'+p.pages.length+'页'}><div className="project-image"><img src={p.image} alt={p.name+'作品效果图'} loading="lazy"/><span className="project-rail-title" aria-hidden="true">{p.name}</span><span className="project-open" aria-hidden="true">↗</span></div><div className="project-card-copy"><div className="project-meta"><span><i/> {p.id} / {p.category}</span><span>{String(p.pages.length).padStart(2,'0')} PAGES</span></div><div className="project-info"><h3>{p.name}</h3></div><p className="project-subtitle">{p.subtitle}</p><div className="tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div></div></button>)}</div>}</div>)})}</div></div></section>
      <section className="strengths shell section" id="strengths"><div className="section-label reveal"><span>04 / MY APPROACH</span><span>能力相互连接，想法持续生长。</span></div><div className="section-heading reveal" style={{'--d':'90ms'}}><h2>不止于视觉<span className="accent">.</span></h2><p>用研究理解问题，用设计回应需求，<br/>用内容建立连接。</p></div><div className="strength-grid">{advantages.map(([n,title,en,desc,tools])=><article className="strength-card reveal" key={n} style={{'--d':((Number(n)-1)*90)+'ms'}}><div className="strength-top"><span>{n}</span><span className={'skill-symbol symbol-'+n} aria-hidden="true">{['◎','◇','↗','✳'][Number(n)-1]}</span></div><span className="eyebrow muted">{en}</span><h3>{title}</h3><p>{desc}</p><div className="tools">{tools}</div></article>)}</div></section>
      <section className="contact portfolio-ending" id="contact" aria-label="感谢观看与联系方式"><div className="ending-stage"><CoverArtwork ending onCopy={()=>copy('491134402@qq.com','邮箱已复制','请复制邮箱：491134402@qq.com')} onCopyPhone={()=>copy('18571920830','号码已复制','请复制号码：185 7192 0830')}/></div><footer className="shell"><a href="#home">沈谭梦 / SHEN TANMENG</a><span>© {new Date().getFullYear()} · Personal Design Portfolio</span><a href="#home">回到顶部 ↑</a></footer></section>
    </main>
    {project&&<div className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-title" onClick={e=>{if(e.target===e.currentTarget)close();}}><div className="dialog-inner"><div className="dialog-toolbar"><span>{project.id} / {project.category}</span><button className="dialog-close" onClick={close} aria-label="关闭项目详情" autoFocus>关闭 ×</button></div><div className="dialog-intro"><span className="eyebrow muted">SELECTED WORK / {project.pages.length} PAGES</span><h2 id="project-title">{project.name}</h2><h3>{project.summary}</h3><p>{project.detail}</p><div className="tags">{project.tags.map(t=><span key={t}>{t}</span>)}</div></div><div className="project-gallery">{project.pages.map((page,i)=><figure key={page.number}><figcaption><span>{String(i+1).padStart(2,'0')} / {page.caption}</span><button className="page-zoom-link" onClick={()=>setZoom(page)} aria-label={'放大查看'+page.caption+'原图'}>查看原图 ↗</button></figcaption><button className="page-zoom-thumb" onClick={()=>setZoom(page)} aria-label={'放大查看'+page.caption}><img src={page.src} alt={project.name+'：'+page.caption+'，作品集第'+page.number+'页'} loading="lazy"/></button></figure>)}</div><div className="dialog-bottom"><a href="mailto:491134402@qq.com" className="text-link">联系我，了解更多 <Arrow/></a><button onClick={close}>返回作品集 ↑</button></div></div></div>}
    {zoom&&<div className="img-zoom" role="dialog" aria-modal="true" aria-label={'放大查看'+zoom.caption+'原图'} onClick={()=>setZoom(null)}><button className="img-zoom-back" onClick={()=>setZoom(null)} aria-label="返回项目详情">← 返回详情</button><img src={zoom.src} alt={project.name+'：'+zoom.caption} onClick={e=>e.stopPropagation()}/></div>}
    <div className="toast" role="status">{notice}</div>
  </>
}
createRoot(document.getElementById('root')).render(<App/>);
