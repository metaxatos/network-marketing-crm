// Video Progress Persistence E2E Tests
// These tests verify that video progress is saved and restored correctly

describe('Video Training Progress', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login')
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('testpassword')
    cy.get('[data-testid="login-button"]').click()
    
    // Wait for login to complete
    cy.url().should('include', '/dashboard')
  })

  it('should persist video progress across page refreshes', () => {
    // Navigate to a training video
    cy.visit('/training/video/sample-video-id')
    
    // Wait for video to load
    cy.get('[data-testid="video-player"]').should('be.visible')
    
    // Simulate watching video for 30 seconds
    // This would typically involve interacting with the video player
    // or triggering the progress update directly
    cy.window().then((win) => {
      // Simulate video progress update
      win.postMessage({
        type: 'video-progress',
        videoId: 'sample-video-id',
        currentTime: 30,
        duration: 300
      }, '*')
    })
    
    // Wait for progress to be saved
    cy.wait(1000)
    
    // Hard refresh the page
    cy.reload()
    
    // Verify progress was restored
    cy.get('[data-testid="video-player"]').should('be.visible')
    cy.get('[data-testid="progress-indicator"]').should('contain', '30')
    
    // Or check via API call
    cy.window().then(async (win) => {
      const response = await fetch('/api/training/progress')
      const data = await response.json()
      const videoProgress = data.videoProgress.find(p => p.videoId === 'sample-video-id')
      expect(videoProgress.progressSeconds).to.equal(30)
    })
  })

  it('should handle multiple tabs gracefully', () => {
    const videoId = 'sample-video-id'
    
    // Open video in current tab
    cy.visit(`/training/video/${videoId}`)
    cy.get('[data-testid="video-player"]').should('be.visible')
    
    // Simulate progress in first tab
    cy.window().then((win) => {
      win.postMessage({
        type: 'video-progress',
        videoId: videoId,
        currentTime: 45,
        duration: 300
      }, '*')
    })
    
    // Wait for save
    cy.wait(1000)
    
    // Open same video in new tab (simulate by visiting again)
    cy.visit(`/training/video/${videoId}`)
    
    // Progress from second tab
    cy.window().then((win) => {
      win.postMessage({
        type: 'video-progress',
        videoId: videoId,
        currentTime: 60, // Further progress
        duration: 300
      }, '*')
    })
    
    // Wait and verify final progress is the maximum
    cy.wait(1000)
    cy.reload()
    
    cy.get('[data-testid="progress-indicator"]').should('contain', '60')
  })

  it('should mark video as completed when reaching the end', () => {
    const videoId = 'sample-video-id'
    
    cy.visit(`/training/video/${videoId}`)
    cy.get('[data-testid="video-player"]').should('be.visible')
    
    // Simulate completing the video (watch to 95% or end)
    cy.window().then((win) => {
      win.postMessage({
        type: 'video-progress',
        videoId: videoId,
        currentTime: 285, // 95% of 300 seconds
        duration: 300,
        completed: true
      }, '*')
    })
    
    // Wait for completion to be saved
    cy.wait(1000)
    
    // Verify completion status
    cy.get('[data-testid="completion-badge"]').should('be.visible')
    cy.get('[data-testid="completion-badge"]').should('contain', 'Complete')
    
    // Refresh and verify completion persists
    cy.reload()
    cy.get('[data-testid="completion-badge"]').should('be.visible')
  })

  it('should update overall training progress', () => {
    // Visit training dashboard
    cy.visit('/training')
    
    // Check initial progress
    cy.get('[data-testid="overall-progress"]').invoke('text').then((initialProgress) => {
      
      // Complete a video
      cy.visit('/training/video/sample-video-id')
      cy.window().then((win) => {
        win.postMessage({
          type: 'video-progress',
          videoId: 'sample-video-id',
          currentTime: 300,
          duration: 300,
          completed: true
        }, '*')
      })
      
      cy.wait(1000)
      
      // Return to training dashboard
      cy.visit('/training')
      
      // Verify progress increased
      cy.get('[data-testid="overall-progress"]').invoke('text').then((newProgress) => {
        expect(parseInt(newProgress)).to.be.greaterThan(parseInt(initialProgress))
      })
    })
  })
})

describe('Video Training Error Handling', () => {
  it('should gracefully handle network errors during progress save', () => {
    // Intercept and fail progress save requests
    cy.intercept('POST', '/api/training/progress', { statusCode: 500 }).as('failedSave')
    
    cy.visit('/training/video/sample-video-id')
    
    // Attempt to save progress
    cy.window().then((win) => {
      win.postMessage({
        type: 'video-progress',
        videoId: 'sample-video-id',
        currentTime: 30,
        duration: 300
      }, '*')
    })
    
    // Wait for failed request
    cy.wait('@failedSave')
    
    // Verify user sees error message but video still works
    cy.get('[data-testid="error-message"]').should('be.visible')
    cy.get('[data-testid="video-player"]').should('be.visible')
  })
})

// Helper commands for video testing
Cypress.Commands.add('loginAsTestUser', () => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type('test@example.com')
  cy.get('[data-testid="password-input"]').type('testpassword')
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('include', '/dashboard')
})

Cypress.Commands.add('simulateVideoProgress', (videoId, currentTime, duration, completed = false) => {
  cy.window().then((win) => {
    win.postMessage({
      type: 'video-progress',
      videoId: videoId,
      currentTime: currentTime,
      duration: duration,
      completed: completed
    }, '*')
  })
}) 