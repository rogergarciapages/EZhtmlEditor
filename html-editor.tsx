"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Session {
  title: string
  presenter: string
  time: string
  description: string
  hasDownload: boolean
  downloadUrl: string
}

interface Day {
  title: string
  sessions: Session[]
}

export default function HTMLEditor() {
  const [inputHTML, setInputHTML] = useState('')
  const [days, setDays] = useState<Day[]>([])
  const [outputHTML, setOutputHTML] = useState('')

  useEffect(() => {
    if (inputHTML) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(inputHTML, 'text/html')
      const accordion = doc.getElementById('accordion')
      if (accordion) {
        const newDays: Day[] = []
        accordion.querySelectorAll('.card').forEach((card) => {
          const dayTitle = card.querySelector('.btn-link')?.textContent?.trim() || ''
          const sessions: Session[] = []
          card.querySelectorAll('.d-flex.flex-row').forEach((session) => {
            const title = session.querySelector('p[style*="color: #326295"]')?.textContent?.trim() || ''
            const presenter = session.querySelector('.col-lg-3 p:nth-child(2)')?.textContent?.trim() || ''
            const time = session.querySelector('.col-lg-3 p:nth-child(3)')?.textContent?.trim() || ''
            const description = session.querySelector('.col-lg-6 p')?.textContent?.trim() || ''
            const downloadButton = session.querySelector('.btn-light')
            const hasDownload = !!downloadButton
            const downloadUrl = downloadButton?.querySelector('a')?.getAttribute('href') || ''
            sessions.push({ title, presenter, time, description, hasDownload, downloadUrl })
          })
          newDays.push({ title: dayTitle, sessions })
        })
        setDays(newDays)
      }
    }
  }, [inputHTML])

  const updateDay = (dayIndex: number, field: keyof Day, value: string) => {
    setDays(prevDays => {
      const newDays = [...prevDays]
      newDays[dayIndex] = { ...newDays[dayIndex], [field]: value }
      return newDays
    })
  }

  const updateSession = (dayIndex: number, sessionIndex: number, field: keyof Session, value: string | boolean) => {
    setDays(prevDays => {
      const newDays = [...prevDays]
      newDays[dayIndex].sessions[sessionIndex] = { ...newDays[dayIndex].sessions[sessionIndex], [field]: value }
      return newDays
    })
  }

  const addSession = (dayIndex: number) => {
    setDays(prevDays => {
      const newDays = [...prevDays]
      newDays[dayIndex].sessions.push({
        title: 'New Session',
        presenter: '',
        time: '',
        description: '',
        hasDownload: false,
        downloadUrl: ''
      })
      return newDays
    })
  }

  const removeSession = (dayIndex: number, sessionIndex: number) => {
    setDays(prevDays => {
      const newDays = [...prevDays]
      newDays[dayIndex].sessions.splice(sessionIndex, 1)
      return newDays
    })
  }

  const generateHTML = () => {
    let html = '<div id="accordion">'
    days.forEach((day, dayIndex) => {
      html += `
        <div class="card customAccordionList" style="background: #f3f6fd;">
          <div id="heading${dayIndex}" class="card-header" style="background: #f3f6fd;">
            <p class="mb-0"><button class="btn btn-link" style="width: 100%; text-align: left; color: #326295;" data-toggle="collapse" data-target="#collapse${dayIndex}" aria-expanded="true" aria-controls="collapse${dayIndex}">
              <img style="margin-right: 7px;" src="https://legal-learning.fifa.com/draftfile.php/181/user/draft/55427078/filesDarkBlue.png" width="25"> ${day.title}
            </button></p>
          </div>
          <div id="collapse${dayIndex}" class="collapse" aria-labelledby="heading${dayIndex}" data-parent="#accordion">
            <div class="card-body">
      `
      day.sessions.forEach(session => {
        html += `
          <div class="d-flex flex-row">
            <div class="col-lg-3">
              <p style="margin: 0; color: #326295; font-family: Bebas Neue, sans-serif; font-size: 1.1rem; letter-spacing: 1px;">
                ${session.title}
              </p>
              <p>${session.presenter}</p>
              <p>${session.time}</p>
            </div>
            <div class="col-lg-6">
              <p>${session.description}</p>
            </div>
            ${session.hasDownload ? `
              <div class="col-lg-3">
                <button class="btn btn-light" style="background: #1f3b59; border-radius: 50px; padding: 5px 15px;" type="button">
                  <a style="color: white;" href="${session.downloadUrl}" target="_blank" rel="noopener">
                    Presentation <i class="fa fa-arrow-circle-down" aria-hidden="true"></i>
                  </a>
                </button>
              </div>
            ` : ''}
          </div>
          <div> </div>
        `
      })
      html += `
            </div>
          </div>
        </div>
      `
    })
    html += '</div>'
    setOutputHTML(html)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Input HTML</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your HTML here"
              value={inputHTML}
              onChange={(e) => setInputHTML(e.target.value)}
              rows={10}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Edit Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {days.map((day, dayIndex) => (
                <AccordionItem value={`day-${dayIndex}`} key={dayIndex}>
                  <AccordionTrigger>
                    <Input
                      value={day.title}
                      onChange={(e) => updateDay(dayIndex, 'title', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </AccordionTrigger>
                  <AccordionContent>
                    {day.sessions.map((session, sessionIndex) => (
                      <div key={sessionIndex} className="mb-4 p-2 border rounded">
                        <Label>Title</Label>
                        <Input
                          value={session.title}
                          onChange={(e) => updateSession(dayIndex, sessionIndex, 'title', e.target.value)}
                        />
                        <Label>Presenter</Label>
                        <Input
                          value={session.presenter}
                          onChange={(e) => updateSession(dayIndex, sessionIndex, 'presenter', e.target.value)}
                        />
                        <Label>Time</Label>
                        <Input
                          value={session.time}
                          onChange={(e) => updateSession(dayIndex, sessionIndex, 'time', e.target.value)}
                        />
                        <Label>Description</Label>
                        <Textarea
                          value={session.description}
                          onChange={(e) => updateSession(dayIndex, sessionIndex, 'description', e.target.value)}
                        />
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="checkbox"
                            checked={session.hasDownload}
                            onChange={(e) => updateSession(dayIndex, sessionIndex, 'hasDownload', e.target.checked)}
                            id={`has-download-${dayIndex}-${sessionIndex}`}
                          />
                          <Label htmlFor={`has-download-${dayIndex}-${sessionIndex}`}>Has Download</Label>
                        </div>
                        {session.hasDownload && (
                          <Input
                            value={session.downloadUrl}
                            onChange={(e) => updateSession(dayIndex, sessionIndex, 'downloadUrl', e.target.value)}
                            placeholder="Download URL"
                          />
                        )}
                        <Button onClick={() => removeSession(dayIndex, sessionIndex)} variant="destructive" className="mt-2">
                          Remove Session
                        </Button>
                      </div>
                    ))}
                    <Button onClick={() => addSession(dayIndex)}>Add Session</Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Button onClick={generateHTML}>Generate HTML</Button>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Output HTML</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={outputHTML} readOnly rows={10} />
        </CardContent>
      </Card>
    </div>
  )
}

