import './App.css';
import { useEffect, useState } from 'react';

function App() {

  const [word, setWord] = useState(undefined)
  const [userWord, setUserWord] = useState([]) 
  const [attempt, setAttempt] = useState(10)
  const [attemptedLetters, setAttemptedLetters] = useState([])
  const [username, setUsername] = useState(undefined)
  const [data, setData] = useState(undefined)
  const [score, setScore] = useState(undefined)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    (async () => {
      const newWord = await getWord()
      console.log(newWord)
      setData(newWord.data)
      setWord(newWord.data.word.toLowerCase())
    })()
    return () => {}
  }, [])
  
  useEffect(() => {

    const handleKeyDown = async (event) => {
      console.log('A key was pressed', event.key)
      console.log(userWord, word)
      
      if(word.includes(event.key) && !userWord.includes(event.key)) {
        const tmp = word.split('').filter(el => {
          return el === event.key
        })
        console.log("tmp : " + tmp)
        setUserWord([...userWord, ...tmp])
      }

      if(!word.includes(event.key)) setAttemptedLetters([...attemptedLetters, ...event.key])
      console.log("userWord : " + userWord)

      if(!userWord.includes(event.key) && !attemptedLetters.includes(event.key)){
        setAttempt(attempt - 1)
      }
      
      console.log("attempt : ", attempt)

      if((word.length === userWord.length || attempt === 0) && !gameOver ){
        let isWin = undefined
        if(attempt > 0 || (word.length === userWord.length && attempt === 0 )) isWin = true
        else isWin = false
        const body = {...data, isWin, username: username | "jhon doe"}
        const score = await postData(body)
        setScore(score)
        setGameOver(true)
        console.log("res : ", score)
        if(isWin) alert("tu as gagné !")
        else alert("tu as perdu.")
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [word, userWord, attempt, data, attemptedLetters, username, gameOver])

  const postData = async (body) => {
    console.log("body : ", body)
    const dataJson = await fetch("https://animalfinderapi.herokuapp.com/game", {
      method:'post',
      headers: {"Content-type": "application/json",},
      body: JSON.stringify(body)
    })
    return await dataJson.json()
  }

  const handleClick = async (event) => {
    const res = await getUsername(username)
    if(!res.data){
      alert("username not found")
    }
    else alert("username already exist")
    setUsername(username)
    console.log("username data : ", res)
  }
  
  const getWord = async () => {
    const dataJson = await fetch("https://animalfinderapi.herokuapp.com/word")
    return await dataJson.json()
  }

  const getUsername = async (username) => {
    console.log(`__${username}__`)
    const dataJson = await fetch(`https://animalfinderapi.herokuapp.com/${username}`)
    return await dataJson.json()
  }

  return (
    <div className="App">
      <div> {word} </div>
      <label> username : </label>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/> 
      <button onClick={handleClick}> submit </button>
      <div className='displayDiv'> 
        {word && word.split('').map((letter, index) => (
           userWord.includes(letter) 
           ? <div className='userWord' key={index} > {letter} </div>
           : <div className='userWord' key={index} > {"_"} </div>
        ))} 
      </div>
      <div className='leaderboard'>
        {score && score.data.map((user) =>
          <div className='scoreDiv'> 
            <img className='avatar' src={user.avatar}/>
            <p>  {user.username} </p>
            <p> {user.score} point</p>
          </div> 
        )}
      </div>
    </div>
  );
}

export default App;
