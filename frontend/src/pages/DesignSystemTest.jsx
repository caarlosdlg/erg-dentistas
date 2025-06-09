import React, { useState } from 'react'


const DesignSystemTest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="p-8 space-y-8 bg-background-primary min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            DentalERP Design System Test
          </h1>
          <p className="text-text-secondary">
            Testing all components with Tailwind CSS v3
          </p>
        </div>

        {/* Basic Tailwind Test */}
        <Card className="mb-8">
          <Card.Header>
            <h2 className="text-2xl font-semibold text-primary-600">
              Basic Tailwind CSS Test
            </h2>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary-500 text-white p-4 rounded-lg">
                Primary Color
              </div>
              <div className="bg-secondary-500 text-white p-4 rounded-lg">
                Secondary Color
              </div>
              <div className="bg-accent-blue-500 text-white p-4 rounded-lg">
                Accent Blue
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Button Tests */}
        <Card className="mb-8">
          <Card.Header>
            <h3 className="text-xl font-semibold">Button Components</h3>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="sm">
                Primary Small
              </Button>
              <Button variant="secondary" size="md">
                Secondary Medium
              </Button>
              <Button variant="outline" size="lg">
                Outline Large
              </Button>
              <Button variant="danger" disabled>
                Disabled Button
              </Button>
              <Button variant="success" loading>
                Loading Button
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* Badge Tests */}
        <Card className="mb-8">
          <Card.Header>
            <h3 className="text-xl font-semibold">Badge Components</h3>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-wrap gap-4">
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="danger">Cancelled</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="primary" size="lg">
                Large Badge
              </Badge>
            </div>
          </Card.Content>
        </Card>

        {/* Input Test */}
        <Card className="mb-8">
          <Card.Header>
            <h3 className="text-xl font-semibold">Input Components</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4 max-w-md">
              <Input
                label="Test Input"
                placeholder="Enter some text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="This is a helper text"
              />
              <Input
                label="Email Input"
                type="email"
                placeholder="user@example.com"
                required
              />
              <Input
                label="Error State"
                error="This field has an error"
                placeholder="Error input..."
              />
            </div>
          </Card.Content>
        </Card>

        {/* Modal Test */}
        <Card>
          <Card.Header>
            <h3 className="text-xl font-semibold">Modal Component</h3>
          </Card.Header>
          <Card.Content>
            <Button 
              variant="primary" 
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal
            </Button>
            
            <Modal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            >
              <Modal.Header>
                <h3 className="text-lg font-semibold">Test Modal</h3>
              </Modal.Header>
              <Modal.Content>
                <p className="text-text-secondary">
                  This is a test modal to verify that our modal component 
                  is working correctly with the new Tailwind CSS setup.
                </p>
              </Modal.Content>
              <Modal.Footer>
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Confirm
                </Button>
              </Modal.Footer>
            </Modal>
          </Card.Content>
        </Card>

      </div>
    </div>
  )
}

export default DesignSystemTest
