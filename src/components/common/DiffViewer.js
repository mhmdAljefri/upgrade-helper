import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { parseDiff, withChangeSelect } from 'react-diff-view'
import 'react-diff-view/style/index.css'
import Diff from './Diff/Diff'
import Loading from './Loading'

const Container = styled.div`
  width: 90%;
`

const getPatchURL = ({ fromVersion, toVersion }) =>
  `https://raw.githubusercontent.com/react-native-community/rn-diff-purge/diffs/diffs/${fromVersion}..${toVersion}.diff`

const getDiffKey = ({ oldRevision, newRevision }) =>
  `${oldRevision}${newRevision}`

const DiffViewer = ({
  showDiff,
  fromVersion,
  toVersion,
  selectedChanges,
  onToggleChangeSelection
}) => {
  const [isLoading, setLoading] = useState(true)
  const [diff, setDiff] = useState(null)
  const [completedDiffs, setCompletedDiffs] = useState([])

  const handleCompleteDiff = diffKey => {
    if (completedDiffs.includes(diffKey)) {
      return setCompletedDiffs(prevCompletedDiffs =>
        prevCompletedDiffs.filter(completedDiff => completedDiff !== diffKey)
      )
    }

    setCompletedDiffs(prevCompletedDiffs => [...prevCompletedDiffs, diffKey])
  }

  useEffect(() => {
    if (!showDiff) {
      return
    }

    const fetchDiff = async () => {
      setLoading(true)

      const response = await (await fetch(
        getPatchURL({ fromVersion, toVersion })
      )).text()

      setDiff(
        parseDiff(response).sort(({ newPath }) =>
          newPath.includes('package.json') ? -1 : 1
        )
      )

      setLoading(false)
    }

    fetchDiff()
  }, [fromVersion, showDiff, toVersion])

  if (!showDiff) {
    return null
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <Container>
      {diff.map(diff => {
        const diffKey = getDiffKey(diff)

        return (
          <Diff
            key={`${diff.oldRevision}${diff.newRevision}`}
            {...diff}
            diffKey={diffKey}
            isDiffCompleted={completedDiffs.includes(diffKey)}
            onCompleteDiff={handleCompleteDiff}
            selectedChanges={selectedChanges}
            onToggleChangeSelection={onToggleChangeSelection}
          />
        )
      })}
    </Container>
  )
}

export default withChangeSelect({ multiple: true })(DiffViewer)