import { useEffect, useState } from 'react';
import './App.css';
import { Repo } from './repo';
import { repoBox } from './repo_box';
import { TypeAnimation } from 'react-type-animation';

function App() {

  const [repos, setRepos] = useState<Repo[]>([])

  useEffect(() => {
    fetch("https://api.github.com/users/dron3flyv3r/repos?sort=created").then((res) => res.json()).then((rep) => {
      let temp: Repo[] = []
      rep.map((item: Repo) =>
        temp.push(
          {
            name: item.name,
            description: item.description,
            html_url: item.html_url,
            id: item.id
          }
        )
      )
      setRepos(temp)
    }).catch((err) => console.log(err))
  }, [])



  return (
    <>
      <div className="intro">
        <img src="https://avatars.githubusercontent.com/u/84443539?s=400&u=ce6998ef41de59c4926832c1c76feaff423b3973&v=4" alt='Kasper H. Larsen' />
        <div>
          <h1>Hi</h1>
          <h2>I'm Kasper Larsen</h2>
          <TypeAnimation
            sequence={[
              "I'm a Python dev",
              1000,
              "I'm a React dev",
              1000,
              "I'm a Flutter dev",
              1000,
              "I'm a Photographer",
              1000,
              "I'm a Student",
              1000,
              "I'm a Java dev",
              1000,
              "I'm a Graphic designer",
              1000,
              "I'm a Web dev",
              1000,
            ]}
            repeat={Infinity}
            wrapper='h3'
          />
          <div className='socials'>
            <a href="https://github.com/dron3flyv3r">
              <svg width="75px" height="75px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><path fill="#ffc60c" fill-rule="evenodd" d="M8 1C4.133 1 1 4.13 1 7.993c0 3.09 2.006 5.71 4.787 6.635.35.064.478-.152.478-.337 0-.166-.006-.606-.01-1.19-1.947.423-2.357-.937-2.357-.937-.319-.808-.778-1.023-.778-1.023-.635-.434.048-.425.048-.425.703.05 1.073.72 1.073.72.624 1.07 1.638.76 2.037.582.063-.452.244-.76.444-.935-1.554-.176-3.188-.776-3.188-3.456 0-.763.273-1.388.72-1.876-.072-.177-.312-.888.07-1.85 0 0 .586-.189 1.924.716A6.711 6.711 0 018 4.381c.595.003 1.194.08 1.753.236 1.336-.905 1.923-.717 1.923-.717.382.963.142 1.674.07 1.85.448.49.72 1.114.72 1.877 0 2.686-1.638 3.278-3.197 3.45.251.216.475.643.475 1.296 0 .934-.009 1.688-.009 1.918 0 .187.127.404.482.336A6.996 6.996 0 0015 7.993 6.997 6.997 0 008 1z" clip-rule="evenodd" /></svg>
            </a>
            <a href="https://www.instagram.com/droneflyver/">
              <svg width="75px" height="75px" viewBox="0 0 24 24" fill="#1e1e1e" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.65 7.2H16.66M8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20ZM15.75 12C15.75 14.0711 14.0711 15.75 12 15.75C9.92893 15.75 8.25 14.0711 8.25 12C8.25 9.92893 9.92893 8.25 12 8.25C14.0711 8.25 15.75 9.92893 15.75 12Z" stroke="#ffc60c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg></a>
          </div>
        </div>
      </div>
      <svg id="visual" viewBox="0 0 1920 200" preserveAspectRatio="xMidYMin" width="100%" height="200" xmlns="http://www.w3.org/2000/svg" version="1.1"><rect x="0" y="0" width="100%" height="200" fill="#ffc60c"></rect><path d="M0 73L45.7 80.2C91.3 87.3 182.7 101.7 274.2 117.3C365.7 133 457.3 150 548.8 154.7C640.3 159.3 731.7 151.7 823 133.5C914.3 115.3 1005.7 86.7 1097 72.3C1188.3 58 1279.7 58 1371.2 68.5C1462.7 79 1554.3 100 1645.8 116.8C1737.3 133.7 1828.7 146.3 1874.3 152.7L1920 159L1920 0L1874.3 0C1828.7 0 1737.3 0 1645.8 0C1554.3 0 1462.7 0 1371.2 0C1279.7 0 1188.3 0 1097 0C1005.7 0 914.3 0 823 0C731.7 0 640.3 0 548.8 0C457.3 0 365.7 0 274.2 0C182.7 0 91.3 0 45.7 0L0 0Z" fill="#1e1e1e" stroke-linecap="round" stroke-linejoin="miter"></path></svg>
      <div className="aboute">
        <h1>Aboute Me</h1>
        <p>My name is Kasper and I'm 19. I am a programmer and photographer. I am new to the field of AI development, but so far I am enjoying it. In addition to programming, I also have experience with graphic design and front-end development. Currently, I am learning Flutter to develop mobile apps. <br /><br /> To contack me, send me a E-mail on <a href="mailto:contact@kasperlarsen.tech">contact@kasperlarsen.tech</a></p>
      </div>
      {repoBox(repos)}
    </>
  )
}

export default App;