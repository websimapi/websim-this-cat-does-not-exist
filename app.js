const { useState, useEffect, useRef, useSyncExternalStore } = React;
const { createRoot } = ReactDOM;

// Main App Component
const App = () => {
    const [activeTab, setActiveTab] = useState('gallery');
    const [userPrompt, setUserPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewDescription, setPreviewDescription] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [modalData, setModalData] = useState(null);
    const [randomnessLevel, setRandomnessLevel] = useState(50);
    const username = room.party.client.username;
    
    // Get cats from the database using React 18's useSyncExternalStore
    const cats = useSyncExternalStore(
        room.collection('cat').subscribe,
        () => room.collection('cat').getList().reverse() // newest first
    );
    
    const generateCat = async () => {
        try {
            setIsGenerating(true);
            
            // Generate the cat description based on user prompt
            const description = await generateCatDescription(userPrompt);
            setPreviewDescription(description);
            
            // Generate the cat image based on the description
            const imageUrl = await generateCatImage(description);
            setPreviewImage(imageUrl);
            
            setIsGenerating(false);
        } catch (error) {
            console.error("Error in cat generation process:", error);
            setIsGenerating(false);
            alert("Failed to generate cat. Please try again.");
        }
    };
    
    const saveCat = async () => {
        if (!previewDescription || !previewImage) return;
        
        try {
            // Store the cat in the database
            await room.collection('cat').create({
                description: previewDescription,
                imageUrl: previewImage,
                name: extractCatName(previewDescription),
                randomness: randomnessLevel
            });
            
            // Reset the form after saving
            setPreviewDescription('');
            setPreviewImage('');
            setUserPrompt('');
            
            // Switch to gallery view to see the new cat
            setActiveTab('gallery');
        } catch (error) {
            console.error("Error saving cat:", error);
            alert("Failed to save cat. Please try again.");
        }
    };
    
    const openModal = (cat) => {
        setModalData(cat);
    };
    
    const closeModal = () => {
        setModalData(null);
    };
    
    return (
        <div className="container">
            <header>
                <h1>This Cat Does Not Exist</h1>
                <p className="subtitle">Generate fictional cats with AI</p>
            </header>
            
            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
                    onClick={() => setActiveTab('gallery')}
                >
                    Gallery
                </button>
                <button 
                    className={`tab ${activeTab === 'generator' ? 'active' : ''}`}
                    onClick={() => setActiveTab('generator')}
                >
                    Generate Cat
                </button>
            </div>
            
            {activeTab === 'generator' && (
                <div className="generator-section">
                    <div className="form-group">
                        <label htmlFor="cat-prompt">Describe your imaginary cat:</label>
                        <textarea
                            id="cat-prompt"
                            className="input-field"
                            rows="3"
                            placeholder="e.g., A fluffy blue cat with golden eyes and silver stripes, or leave blank for a random cat"
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            disabled={isGenerating}
                        ></textarea>
                    </div>
                    
                    <div className="form-group">
                        <label>Randomness Level: {randomnessLevel}%</label>
                        <div className="slider-container">
                            <span>Specific</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={randomnessLevel}
                                onChange={(e) => setRandomnessLevel(parseInt(e.target.value))}
                                className="slider"
                                disabled={isGenerating}
                            />
                            <span>Random</span>
                        </div>
                    </div>
                    
                    <button 
                        className="button button-primary" 
                        onClick={generateCat}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Cat'}
                    </button>
                    
                    {isGenerating && (
                        <div className="loading-indicator">
                            <div className="spinner"></div>
                        </div>
                    )}
                    
                    {(previewDescription || previewImage) && (
                        <div className="preview-container">
                            <h3>Preview</h3>
                            {previewImage && (
                                <img 
                                    src={previewImage} 
                                    alt="Generated cat preview" 
                                    className="image-preview"
                                />
                            )}
                            {previewDescription && (
                                <div className="description-preview">
                                    {previewDescription}
                                </div>
                            )}
                            <button 
                                className="button" 
                                onClick={saveCat}
                                disabled={isGenerating}
                            >
                                Save to Gallery
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'gallery' && (
                <div className="gallery-section">
                    <div className="gallery-title">
                        <h2>Cat Gallery</h2>
                        <button 
                            className="button" 
                            onClick={() => setActiveTab('generator')}
                        >
                            Create New Cat
                        </button>
                    </div>
                    
                    {cats.length === 0 ? (
                        <p>No cats generated yet. Be the first to create one!</p>
                    ) : (
                        <div className="cat-grid">
                            {cats.map(cat => (
                                <div className="cat-card" key={cat.id} onClick={() => openModal(cat)}>
                                    <img 
                                        src={cat.imageUrl} 
                                        alt={cat.name || "Fictional cat"} 
                                        className="cat-image"
                                    />
                                    <div className="cat-info">
                                        <h3 className="cat-name">{cat.name || "Unnamed Cat"}</h3>
                                        <p className="cat-description">
                                            {cat.description && cat.description.substring(0, 100)}...
                                        </p>
                                        <div className="cat-details">
                                            <div className="cat-creator">
                                                <img 
                                                    src={`https://images.websim.ai/avatar/${cat.username}`}
                                                    alt={cat.username}
                                                    className="user-avatar"
                                                />
                                                <span>{cat.username}</span>
                                            </div>
                                            <span>{formatDate(cat.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {modalData && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>×</button>
                        <img 
                            src={modalData.imageUrl} 
                            alt={modalData.name || "Fictional cat"} 
                            className="detail-image"
                        />
                        <h2>{modalData.name || "Unnamed Cat"}</h2>
                        <div className="cat-creator">
                            <img 
                                src={`https://images.websim.ai/avatar/${modalData.username}`}
                                alt={modalData.username}
                                className="user-avatar"
                            />
                            <span>Created by {modalData.username}</span>
                            <span style={{marginLeft: 'auto'}}>{formatDate(modalData.created_at)}</span>
                        </div>
                        <div className="detail-text">
                            <h3>Description:</h3>
                            <p>{modalData.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Render the app
const root = createRoot(document.getElementById('root'));
root.render(<App />);

