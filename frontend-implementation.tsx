// Updated handleFindMatches implementation for the frontend
const handleFindMatches = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setMatches([])
    setSelectedMentorId(null)

    const data = {
      name: formData.name,
      email: formData.email,
      goals: formData.goals,
    }

    try {
      const response = await matchingApi.findMatches(data)
      
      if (response.success) {
        setMatches(response.matches || [])
        
        if (response.message === "No matching mentors found") {
          setError("No matching mentors found. Try adjusting your goals or check back later.")
        } else if (response.matches.length > 0) {
          setSuccess("We found some great mentors for you!")
        } else {
          setError("No matching mentors found. Try adjusting your goals or check back later.")
        }
      } else {
        throw new Error(response.error || "Unknown error occurred")
      }
    } catch (apiError: any) {
      // Handle HTTP errors
      if (apiError.response) {
        const status = apiError.response.status
        const errorData = apiError.response.data
        
        if (status === 409) {
          setError("A mentee with this email already exists. Please use a different email or log in.")
        } else if (errorData && errorData.error) {
          setError(errorData.error)
        } else {
          setError(`Error (${status}): Failed to find matches`)
        }
      } else if (apiError.message) {
        setError(apiError.message)
      } else {
        setError("Failed to find matches. Please try again later.")
      }
    }
  } catch (err: any) {
    console.error("Failed to find matches:", err)
    setError("An unexpected error occurred. Please try again.")
  } finally {
    setLoading(false)
  }
} 