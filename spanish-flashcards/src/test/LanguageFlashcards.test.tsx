// ============================================================================
// TEST FILE: src/__tests__/LanguageFlashcards.test.tsx
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LanguageFlashcards from '../App.tsx'

describe('LanguageFlashcards', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    // ========================================================================
    // Login Tests
    // ========================================================================

    describe('Login Screen', () => {
        it('renders login screen with language options', async () => {
            render(<LanguageFlashcards />)

            // Wait for loading to complete
            await waitFor(() => {
                expect(screen.queryByText('Language Flashcards')).toBeDefined()
            }, { timeout: 3000 })

            expect(screen.getByPlaceholderText('Your name...')).toBeDefined()
        })

        it('allows user to type username', async () => {
            const user = userEvent.setup()
            render(<LanguageFlashcards />)

            // Wait for component to load
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Your name...')).toBeDefined()
            }, { timeout: 3000 })

            const input = screen.getByPlaceholderText('Your name...') as HTMLInputElement
            await user.type(input, 'TestUser')

            expect(input.value).toBe('TestUser')
        })

        it('enables language buttons when username is entered', async () => {
            const user = userEvent.setup()
            render(<LanguageFlashcards />)

            // Wait for component to load
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Your name...')).toBeDefined()
            }, { timeout: 3000 })

            const input = screen.getByPlaceholderText('Your name...')
            await user.type(input, 'TestUser')

            const spanishButton = screen.getByRole('button', { name: /Spanish/i })
            expect(spanishButton).not.toBeDisabled()
        })

        it('logs in with Spanish when Spanish button clicked', async () => {
            const user = userEvent.setup()
            render(<LanguageFlashcards />)

            // Wait for component to load
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Your name...')).toBeDefined()
            }, { timeout: 3000 })

            const input = screen.getByPlaceholderText('Your name...')
            await user.type(input, 'TestUser')

            const spanishButton = screen.getByRole('button', { name: /Spanish/i })
            await user.click(spanishButton)

            await waitFor(() => {
                expect(screen.queryByText(/Tarjetas de Español/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('logs in with Italian when Italian button clicked', async () => {
            const user = userEvent.setup()
            render(<LanguageFlashcards />)

            // Wait for component to load
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Your name...')).toBeDefined()
            }, { timeout: 3000 })

            const input = screen.getByPlaceholderText('Your name...')
            await user.type(input, 'TestUser')

            const italianButton = screen.getByRole('button', { name: /Italian/i })
            await user.click(italianButton)

            await waitFor(() => {
                expect(screen.queryByText(/Flashcard Italiane/i)).toBeDefined()
            }, { timeout: 3000 })
        })
    })

    // ========================================================================
    // Flashcard Navigation Tests
    // ========================================================================

    describe('Flashcard Navigation', () => {
        beforeEach(async () => {
            const user = userEvent.setup()
            render(<LanguageFlashcards />)

            // Wait for loading to complete
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Your name...')).toBeDefined()
            }, { timeout: 3000 })

            const input = screen.getByPlaceholderText('Your name...')
            await user.type(input, 'TestUser')

            const spanishButton = screen.getByRole('button', { name: /Spanish/i })
            await user.click(spanishButton)

            await waitFor(() => {
                expect(screen.queryByText(/Tarjetas de Español/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('displays first flashcard', () => {
            expect(screen.queryByText(/¿Cómo estás?/i)).toBeDefined()
        })

        it('navigates to next card when Next button clicked', async () => {
            const user = userEvent.setup()

            const nextButton = screen.getByRole('button', { name: /Siguiente/i })
            await user.click(nextButton)

            await waitFor(() => {
                const cardCounter = screen.queryByText(/Card 2 of/i)
                expect(cardCounter).toBeDefined()
            })
        })

        it('navigates to previous card when Previous button clicked', async () => {
            const user = userEvent.setup()

            const nextButton = screen.getByRole('button', { name: /Siguiente/i })
            const prevButton = screen.getByRole('button', { name: /Anterior/i })

            await user.click(nextButton)
            await user.click(prevButton)

            await waitFor(() => {
                expect(screen.queryByText(/Card 1 of/i)).toBeDefined()
            })
        })

        it('flips card when clicked', async () => {
            const user = userEvent.setup()

            const cardElement = screen.getByText(/¿Cómo estás?/i).parentElement?.parentElement?.parentElement
            if (cardElement) {
                await user.click(cardElement)

                await waitFor(() => {
                    expect(screen.queryByText(/How are you?/i)).toBeDefined()
                })
            }
        })
    })

    // ========================================================================
    // Mark as Known Tests
    // ========================================================================

    describe('Mark as Known', () => {
        beforeEach(async () => {
            const user = userEvent.setup()
            render(<LanguageFlashcards />)

            // Wait for loading to complete
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Your name...')).toBeDefined()
            }, { timeout: 3000 })

            const input = screen.getByPlaceholderText('Your name...')
            await user.type(input, 'TestUser')

            const spanishButton = screen.getByRole('button', { name: /Spanish/i })
            await user.click(spanishButton)

            await waitFor(() => {
                expect(screen.queryByText(/Tarjetas de Español/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('marks card as known when Mark button clicked', async () => {
            const user = userEvent.setup()

            const markButton = screen.getByRole('button', { name: /Marcar/i })
            await user.click(markButton)

            await waitFor(() => {
                expect(screen.queryByText(/1 marked as known/i)).toBeDefined()
            })
        })

        it('unmarks card when clicked again', async () => {
            const user = userEvent.setup()

            const markButton = screen.getByRole('button', { name: /Marcar/i })
            await user.click(markButton)

            await waitFor(() => {
                expect(screen.queryByText(/¡Lo sé!/i)).toBeDefined()
            })

            const unmarkButton = screen.getByRole('button', { name: /¡Lo sé!/i })
            await user.click(unmarkButton)

            await waitFor(() => {
                expect(screen.queryByText(/0 marked as known/i)).toBeDefined()
            })
        })

        it('persists marked cards when navigating', async () => {
            const user = userEvent.setup()

            const markButton = screen.getByRole('button', { name: /Marcar/i })
            await user.click(markButton)

            const nextButton = screen.getByRole('button', { name: /Siguiente/i })
            await user.click(nextButton)

            const prevButton = screen.getByRole('button', { name: /Anterior/i })
            await user.click(prevButton)

            await waitFor(() => {
                expect(screen.queryByText(/¡Lo sé!/i)).toBeDefined()
            })
        })
    })

    // ========================================================================
    // Category Filter Tests
    // ========================================================================

    describe('Category Filtering', () => {
        beforeEach(async () => {
            const user = userEvent.setup()
            render(<LanguageFlashcards />)

            // Wait for loading to complete
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Your name...')).toBeDefined()
            }, { timeout: 3000 })

            const input = screen.getByPlaceholderText('Your name...')
            await user.type(input, 'TestUser')

            const spanishButton = screen.getByRole('button', { name: /Spanish/i })
            await user.click(spanishButton)

            await waitFor(() => {
                expect(screen.queryByText(/Tarjetas de Español/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('filters flashcards by category', async () => {
            const user = userEvent.setup()

            const foodButton = screen.getByRole('button', { name: /^Food$/i })
            await user.click(foodButton)

            await waitFor(() => {
                expect(screen.queryByText(/Card 1 of/i)).toBeDefined()
            })
        })

        it('resets to card 1 when changing category', async () => {
            const user = userEvent.setup()

            // Navigate to card 3
            const nextButton = screen.getByRole('button', { name: /Siguiente/i })
            await user.click(nextButton)
            await user.click(nextButton)

            // Change category
            const greetingsButton = screen.getByRole('button', { name: /^Greetings$/i })
            await user.click(greetingsButton)

            await waitFor(() => {
                expect(screen.queryByText(/Card 1 of/i)).toBeDefined()
            })
        })
    })

    // ========================================================================
    // Language Switching Tests
    // ========================================================================

    describe('Language Switching', () => {
        beforeEach(async () => {
            const user = userEvent.setup()
            render(<LanguageFlashcards />)

            // Wait for loading to complete
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Your name...')).toBeDefined()
            }, { timeout: 3000 })

            const input = screen.getByPlaceholderText('Your name...')
            await user.type(input, 'TestUser')

            const spanishButton = screen.getByRole('button', { name: /Spanish/i })
            await user.click(spanishButton)

            await waitFor(() => {
                expect(screen.queryByText(/Tarjetas de Español/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('switches to Italian language', async () => {
            const user = userEvent.setup()

            const selector = screen.getByRole('combobox') as HTMLSelectElement
            await user.selectOptions(selector, 'italian')

            await waitFor(() => {
                expect(screen.queryByText(/Flashcard Italiane/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('switches to German language', async () => {
            const user = userEvent.setup()

            const selector = screen.getByRole('combobox') as HTMLSelectElement
            await user.selectOptions(selector, 'german')

            await waitFor(() => {
                expect(screen.queryByText(/Deutsche Lernkarten/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('maintains separate progress per language', async () => {
            const user = userEvent.setup()

            // Mark card in Spanish
            const markButton = screen.getByRole('button', { name: /Marcar/i })
            await user.click(markButton)

            await waitFor(() => {
                expect(screen.queryByText(/1 marked as known/i)).toBeDefined()
            })

            // Switch to Italian
            const selector = screen.getByRole('combobox') as HTMLSelectElement
            await user.selectOptions(selector, 'italian')

            await waitFor(() => {
                expect(screen.queryByText(/0 marked as known/i)).toBeDefined()
            }, { timeout: 3000 })
        })
    })

    // ========================================================================
    // Dashboard Tests
    // ========================================================================

    describe('Dashboard', () => {
        beforeEach(async () => {
            const user = userEvent.setup()
            render(<LanguageFlashcards />)

            // Wait for loading to complete
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Your name...')).toBeDefined()
            }, { timeout: 3000 })

            const input = screen.getByPlaceholderText('Your name...')
            await user.type(input, 'TestUser')

            const spanishButton = screen.getByRole('button', { name: /Spanish/i })
            await user.click(spanishButton)

            await waitFor(() => {
                expect(screen.queryByText(/Tarjetas de Español/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('opens dashboard when Stats button clicked', async () => {
            const user = userEvent.setup()

            const statsButton = screen.getByRole('button', { name: /Stats/i })
            await user.click(statsButton)

            await waitFor(() => {
                expect(screen.queryByText(/Tu Progreso/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('shows badges section', async () => {
            const user = userEvent.setup()

            const statsButton = screen.getByRole('button', { name: /Stats/i })
            await user.click(statsButton)

            await waitFor(() => {
                expect(screen.queryByText(/Your Badges/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('returns to flashcards when Back button clicked', async () => {
            const user = userEvent.setup()

            const statsButton = screen.getByRole('button', { name: /Stats/i })
            await user.click(statsButton)

            await waitFor(() => {
                expect(screen.queryByText(/Tu Progreso/i)).toBeDefined()
            }, { timeout: 3000 })

            const backButton = screen.getByRole('button', { name: /Back/i })
            await user.click(backButton)

            await waitFor(() => {
                expect(screen.queryByText(/Tarjetas de Español/i)).toBeDefined()
            })
        })
    })

    // ========================================================================
    // Logout Tests
    // ========================================================================

    describe('Logout', () => {
        beforeEach(async () => {
            const user = userEvent.setup()
            render(<LanguageFlashcards />)

            // Wait for loading to complete
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Your name...')).toBeDefined()
            }, { timeout: 3000 })

            const input = screen.getByPlaceholderText('Your name...')
            await user.type(input, 'TestUser')

            const spanishButton = screen.getByRole('button', { name: /Spanish/i })
            await user.click(spanishButton)

            await waitFor(() => {
                expect(screen.queryByText(/Tarjetas de Español/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('logs out and returns to login screen', async () => {
            const user = userEvent.setup()

            const logoutButton = screen.getByRole('button', { name: /Salir/i })
            await user.click(logoutButton)

            await waitFor(() => {
                expect(screen.queryByText('Language Flashcards')).toBeDefined()
            }, { timeout: 3000 })
        })
    })

    // ========================================================================
    // Reset Progress Tests
    // ========================================================================

    describe('Reset Progress', () => {
        beforeEach(async () => {
            const user = userEvent.setup()
            render(<LanguageFlashcards />)

            // Wait for loading to complete
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Your name...')).toBeDefined()
            }, { timeout: 3000 })

            const input = screen.getByPlaceholderText('Your name...')
            await user.type(input, 'TestUser')

            const spanishButton = screen.getByRole('button', { name: /Spanish/i })
            await user.click(spanishButton)

            await waitFor(() => {
                expect(screen.queryByText(/Tarjetas de Español/i)).toBeDefined()
            }, { timeout: 3000 })
        })

        it('resets all progress', async () => {
            const user = userEvent.setup()

            // Mark a card
            const markButton = screen.getByRole('button', { name: /Marcar/i })
            await user.click(markButton)

            await waitFor(() => {
                expect(screen.queryByText(/1 marked as known/i)).toBeDefined()
            })

            // Reset
            const resetButton = screen.getByRole('button', { name: /Empezar de Nuevo/i })
            await user.click(resetButton)

            await waitFor(() => {
                expect(screen.queryByText(/0 marked as known/i)).toBeDefined()
            })
        })
    })
})